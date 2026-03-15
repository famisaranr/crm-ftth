import { Injectable, UnauthorizedException, BadRequestException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../database/prisma.service';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import type { LoginDto } from './dto/login.dto';
import type { ChangePasswordDto, ForgotPasswordDto, ResetPasswordDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  // ==========================================================================
  // LOGIN
  // ==========================================================================
  async login(loginDto: LoginDto, ipAddress: string, userAgent: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
      include: {
        user_roles: { include: { role: true } },
        user_scopes: true,
      },
    });

    if (!user) {
      await this.logFailedAttempt(null, loginDto.email, ipAddress);
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException('Account is not active');
    }

    if (user.locked_until && user.locked_until > new Date()) {
      throw new UnauthorizedException('Account is temporarily locked');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password_hash);
    if (!isPasswordValid) {
      await this.handleFailedLogin(user.id, loginDto.email, ipAddress, user.failed_login_count);
      throw new UnauthorizedException('Invalid credentials');
    }

    // Reset failed login count
    await this.prisma.user.update({
      where: { id: user.id },
      data: { failed_login_count: 0, last_login_at: new Date(), locked_until: null },
    });

    const { accessToken, refreshToken } = await this.generateTokens(user.id, user.email);

    // Create session
    await this.prisma.session.create({
      data: {
        user_id: user.id,
        token_hash: await bcrypt.hash(refreshToken, 10),
        ip_address: ipAddress,
        user_agent: userAgent,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    // Audit log
    await this.createAuditLog(user.id, 'LOGIN', 'auth', ipAddress, user.user_roles[0]?.role.name);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        roles: user.user_roles.map((ur) => ur.role.name),
        scopes: user.user_scopes,
      },
    };
  }

  // ==========================================================================
  // REFRESH TOKEN
  // ==========================================================================
  async refreshToken(refreshTokenValue: string, ipAddress: string) {
    let payload: { sub: string; email: string; type: string };
    try {
      payload = this.jwtService.verify(refreshTokenValue, {
        secret: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'your-secret-key-change-me',
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('Invalid token type');
    }

    const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user || user.status !== 'ACTIVE') {
      throw new UnauthorizedException('User not found or inactive');
    }

    // Find and validate session
    const sessions = await this.prisma.session.findMany({
      where: { user_id: user.id, revoked_at: null },
      orderBy: { created_at: 'desc' },
      take: 5,
    });

    let validSession = false;
    for (const session of sessions) {
      const isMatch = await bcrypt.compare(refreshTokenValue, session.token_hash);
      if (isMatch && session.expires_at > new Date()) {
        validSession = true;
        // Revoke old session
        await this.prisma.session.update({
          where: { id: session.id },
          data: { revoked_at: new Date() },
        });
        break;
      }
    }

    if (!validSession) {
      throw new UnauthorizedException('Session expired or revoked');
    }

    const { accessToken, refreshToken: newRefreshToken } = await this.generateTokens(user.id, user.email);

    // Create new session
    await this.prisma.session.create({
      data: {
        user_id: user.id,
        token_hash: await bcrypt.hash(newRefreshToken, 10),
        ip_address: ipAddress,
        user_agent: 'refresh',
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return { access_token: accessToken, refresh_token: newRefreshToken };
  }

  // ==========================================================================
  // LOGOUT
  // ==========================================================================
  async logout(userId: string, ipAddress: string) {
    // Revoke all active sessions for user
    await this.prisma.session.updateMany({
      where: { user_id: userId, revoked_at: null },
      data: { revoked_at: new Date() },
    });

    await this.createAuditLog(userId, 'STATUS_CHANGE', 'auth', ipAddress, undefined, {
      action: 'logout',
    });

    return { message: 'Logged out successfully' };
  }

  // ==========================================================================
  // FORGOT PASSWORD
  // ==========================================================================
  async forgotPassword(dto: ForgotPasswordDto, ipAddress: string) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });

    // Always return success to prevent email enumeration
    if (!user) {
      return { message: 'If the email exists, a reset link has been sent' };
    }

    // Generate reset token (stored as a special session)
    const resetToken = randomUUID();

    await this.prisma.session.create({
      data: {
        user_id: user.id,
        token_hash: await bcrypt.hash(resetToken, 10),
        ip_address: ipAddress,
        user_agent: 'password-reset',
        expires_at: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      },
    });

    // TODO: Send email with reset token via email service
    this.logger.log(`Password reset token for ${user.email}: ${resetToken}`);

    await this.createAuditLog(user.id, 'STATUS_CHANGE', 'auth', ipAddress, undefined, {
      action: 'forgot_password_requested',
    });

    return { message: 'If the email exists, a reset link has been sent' };
  }

  // ==========================================================================
  // RESET PASSWORD
  // ==========================================================================
  async resetPassword(dto: ResetPasswordDto, ipAddress: string) {
    // Find session with matching token
    const recentSessions = await this.prisma.session.findMany({
      where: {
        user_agent: 'password-reset',
        revoked_at: null,
        expires_at: { gt: new Date() },
      },
      include: { user: true },
      orderBy: { created_at: 'desc' },
      take: 50,
    });

    let matchedSession: (typeof recentSessions)[0] | null = null;
    for (const session of recentSessions) {
      const isMatch = await bcrypt.compare(dto.token, session.token_hash);
      if (isMatch) {
        matchedSession = session;
        break;
      }
    }

    if (!matchedSession) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const newHash = await bcrypt.hash(dto.new_password, 10);

    await this.prisma.user.update({
      where: { id: matchedSession.user_id },
      data: {
        password_hash: newHash,
        failed_login_count: 0,
        locked_until: null,
      },
    });

    // Revoke reset session
    await this.prisma.session.update({
      where: { id: matchedSession.id },
      data: { revoked_at: new Date() },
    });

    // Revoke all other sessions (force re-login)
    await this.prisma.session.updateMany({
      where: { user_id: matchedSession.user_id, revoked_at: null },
      data: { revoked_at: new Date() },
    });

    await this.createAuditLog(matchedSession.user_id, 'UPDATE', 'auth', ipAddress, undefined, {
      action: 'password_reset_completed',
    });

    return { message: 'Password reset successfully' };
  }

  // ==========================================================================
  // CHANGE PASSWORD
  // ==========================================================================
  async changePassword(userId: string, dto: ChangePasswordDto, ipAddress: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('User not found');

    const isCurrentValid = await bcrypt.compare(dto.current_password, user.password_hash);
    if (!isCurrentValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    const newHash = await bcrypt.hash(dto.new_password, 10);

    await this.prisma.user.update({
      where: { id: userId },
      data: { password_hash: newHash },
    });

    await this.createAuditLog(userId, 'UPDATE', 'auth', ipAddress, undefined, {
      action: 'password_changed',
    });

    return { message: 'Password changed successfully' };
  }

  // ==========================================================================
  // HELPERS
  // ==========================================================================
  private async generateTokens(userId: string, email: string) {
    const accessPayload = { sub: userId, email };
    const refreshPayload = { sub: userId, email, type: 'refresh' };

    const accessExpiresIn = process.env.JWT_ACCESS_EXPIRY || '15m';
    const refreshExpiresIn = process.env.JWT_REFRESH_EXPIRY || '7d';

    const accessToken = this.jwtService.sign(accessPayload, {
      expiresIn: accessExpiresIn as unknown as number,
    });

    const refreshToken = this.jwtService.sign(refreshPayload, {
      expiresIn: refreshExpiresIn as unknown as number,
      secret: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'your-secret-key-change-me',
    });

    return { accessToken, refreshToken };
  }

  private async handleFailedLogin(userId: string, email: string, ip: string, currentFails: number) {
    const fails = currentFails + 1;
    const lockUntil = fails >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null;

    await this.prisma.user.update({
      where: { id: userId },
      data: { failed_login_count: fails, locked_until: lockUntil },
    });

    await this.logFailedAttempt(userId, email, ip);
  }

  private async logFailedAttempt(userId: string | null, email: string, ip: string) {
    try {
      if (userId) {
        await this.prisma.auditLog.create({
          data: {
            entity_type: 'User',
            entity_id: userId,
            action: 'LOGIN_FAILED',
            actor_ip: ip,
            source_module: 'auth',
            new_value: { email },
          },
        });
      }
    } catch (e) {
      this.logger.error('Failed to write audit log for failed login', e);
    }
  }

  private async createAuditLog(
    userId: string,
    action: 'CREATE' | 'UPDATE' | 'DELETE' | 'STATUS_CHANGE' | 'LOGIN' | 'LOGIN_FAILED' | 'EXPORT' | 'APPROVAL',
    module: string,
    ip: string,
    role?: string,
    newValue?: Record<string, string | number | boolean>,
  ) {
    try {
      await this.prisma.auditLog.create({
        data: {
          entity_type: 'User',
          entity_id: userId,
          action,
          actor_id: userId,
          actor_role: role || null,
          actor_ip: ip,
          source_module: module,
          new_value: newValue ?? undefined,
        },
      });
    } catch (e) {
      this.logger.error('Failed to write audit log', e);
    }
  }
}
