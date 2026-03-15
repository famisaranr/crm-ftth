import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../database/prisma.service';
import * as bcrypt from 'bcrypt';
import type { SubscriberLoginDto } from './dto/subscriber-login.dto';

@Injectable()
export class SubscriberAuthService {
  private readonly logger = new Logger(SubscriberAuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: SubscriberLoginDto, ipAddress: string, userAgent: string) {
    const subscriber = await this.prisma.subscriber.findUnique({
      where: { account_number: loginDto.account_number },
    });

    if (!subscriber || !subscriber.password_hash) {
      throw new UnauthorizedException('Invalid account number or password');
    }

    if (subscriber.status === 'CHURNED' || subscriber.status === 'PROSPECT') {
      throw new UnauthorizedException('Account is not eligible for portal access');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, subscriber.password_hash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid account number or password');
    }

    // Update last login
    await this.prisma.subscriber.update({
      where: { id: subscriber.id },
      data: { last_login_at: new Date() },
    });

    // Generate token specific for subscriber portal
    const payload = { 
      sub: subscriber.id, 
      account_number: subscriber.account_number,
      role: 'SUBSCRIBER' // Inject role for guards
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: (process.env.JWT_ACCESS_EXPIRY || '15m') as any,
    });

    // Generate refresh token
    const refreshToken = this.jwtService.sign(
      { ...payload, type: 'refresh' },
      {
        expiresIn: (process.env.JWT_REFRESH_EXPIRY || '7d') as any,
        secret: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'your-secret-key-change-me',
      },
    );

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      subscriber: {
        id: subscriber.id,
        account_number: subscriber.account_number,
        full_name: subscriber.full_name,
        status: subscriber.status,
      },
    };
  }
}
