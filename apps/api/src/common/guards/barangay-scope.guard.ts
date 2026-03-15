import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { BARANGAY_SCOPE_KEY } from '../decorators/barangay-scope.decorator';
import type { AuthUser } from '../interfaces/auth-user';

/**
 * Guard that enforces tenant (barangay) isolation.
 * Reads the barangay_id from request params or body (as specified by @BarangayScope())
 * and validates that the authenticated user has access to that barangay.
 *
 * Users with roles that have cross-barangay access (Super Admin, Corporate Admin,
 * Operations Manager, Executive, Auditor) bypass barangay scoping.
 */
const CROSS_BARANGAY_ROLES = [
  'Super Admin',
  'Corporate Admin',
  'Operations Manager',
  'Read-only Executive',
  'Auditor',
];

@Injectable()
export class BarangayScopeGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const paramKey = this.reflector.getAllAndOverride<string>(
      BARANGAY_SCOPE_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If no @BarangayScope() is set, no scoping needed
    if (!paramKey) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user: AuthUser = request.user;

    if (!user) {
      throw new ForbiddenException('Authentication required for scoped access');
    }

    // Cross-barangay roles bypass scoping
    const hasCrossAccess = user.roles.some((role) =>
      CROSS_BARANGAY_ROLES.includes(role),
    );
    if (hasCrossAccess) {
      return true;
    }

    // Extract barangay_id from params, body, or query
    const barangayId =
      request.params?.[paramKey] ||
      request.body?.[paramKey] ||
      request.query?.[paramKey];

    if (!barangayId) {
      // No barangay_id in request — for list endpoints, the service layer
      // should filter by user scopes. Allow pass-through.
      return true;
    }

    // Check if user has access to this barangay
    if (!user.scopes.barangay_ids.includes(barangayId)) {
      throw new ForbiddenException(
        'Access denied: you do not have access to this barangay',
      );
    }

    return true;
  }
}
