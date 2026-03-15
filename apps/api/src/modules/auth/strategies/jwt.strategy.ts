import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../../database/prisma.service';
import type { AuthUser } from '../../../common/interfaces/auth-user';

interface JwtPayload {
  sub: string;
  email?: string;
  account_number?: string;
  role?: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'your-secret-key-change-me',
    });
  }

  /**
   * Validate the JWT payload and enrich the request user with
   * roles, permissions, and tenant scopes (barangay/partner IDs).
   */
  async validate(payload: JwtPayload): Promise<any> {
    // Handle subscriber tokens
    if (payload.role === 'SUBSCRIBER') {
      const subscriber = await this.prisma.subscriber.findUnique({
        where: { id: payload.sub },
      });
      if (!subscriber || subscriber.status === 'CHURNED' || subscriber.status === 'PROSPECT') {
        throw new UnauthorizedException('Subscriber not found or inactive');
      }
      return {
        id: subscriber.id,
        sub: subscriber.id, // For compatibility
        account_number: subscriber.account_number,
        full_name: subscriber.full_name,
        role: 'SUBSCRIBER',
      };
    }

    // Handle normal system users
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: {
        user_roles: {
          include: {
            role: {
              include: {
                role_permissions: {
                  include: { permission: true },
                },
              },
            },
          },
        },
        user_scopes: true,
      },
    });

    if (!user || user.status !== 'ACTIVE') {
      throw new UnauthorizedException('User not found or inactive');
    }

    const roles = user.user_roles.map((ur) => ur.role.name);
    const permissions = user.user_roles.flatMap((ur) =>
      ur.role.role_permissions.map((rp) => rp.permission.code),
    );
    const uniquePermissions = [...new Set(permissions)];

    const barangayIds = user.user_scopes
      .filter((s) => s.barangay_id)
      .map((s) => s.barangay_id as string);
    const partnerIds = user.user_scopes
      .filter((s) => s.partner_id)
      .map((s) => s.partner_id as string);

    return {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      roles,
      permissions: uniquePermissions,
      scopes: {
        barangay_ids: barangayIds,
        partner_ids: partnerIds,
      },
    };
  }
}
