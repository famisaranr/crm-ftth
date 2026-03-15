import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import type { AuthUser } from '../interfaces/auth-user';

/**
 * Guard that checks if the authenticated user has the required permissions.
 * Works with the @Permissions() decorator.
 *
 * If no @Permissions() metadata is set on a handler, the guard passes (no restrictions).
 * If permissions are set, ALL listed permissions must be present on the user.
 */
@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If no permissions decorator is applied, allow access
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user: AuthUser = request.user;

    if (!user || !user.permissions) {
      throw new ForbiddenException('Access denied: no permissions found');
    }

    // Super Admin bypasses all permission checks
    if (user.roles.includes('Super Admin')) {
      return true;
    }

    const hasAllPermissions = requiredPermissions.every((perm) =>
      user.permissions.includes(perm),
    );

    if (!hasAllPermissions) {
      throw new ForbiddenException(
        `Access denied: requires permissions [${requiredPermissions.join(', ')}]`,
      );
    }

    return true;
  }
}
