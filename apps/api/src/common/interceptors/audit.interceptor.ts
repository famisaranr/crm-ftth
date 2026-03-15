import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { PrismaService } from '../../database/prisma.service';
import type { AuthUser } from '../interfaces/auth-user';

/**
 * Interceptor that automatically creates audit log entries for
 * state-changing operations (POST, PATCH, PUT, DELETE).
 *
 * Per the audit-completeness guardrail, every mutation must be logged.
 * This interceptor provides a baseline; modules can supplement with
 * more specific audit entries (e.g., before/after values).
 */
@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditInterceptor.name);

  constructor(private readonly prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;

    // Only audit state-changing methods
    if (!['POST', 'PATCH', 'PUT', 'DELETE'].includes(method)) {
      return next.handle();
    }

    const user: AuthUser | undefined = request.user;
    const path: string = request.route?.path || request.url;
    const ip: string = request.ip || request.connection?.remoteAddress || 'unknown';

    return next.handle().pipe(
      tap(async (responseData) => {
        try {
          const action = this.mapMethodToAction(method);
          const entityInfo = this.extractEntityInfo(path, request.params, responseData);

          await this.prisma.auditLog.create({
            data: {
              entity_type: entityInfo.entityType,
              entity_id: entityInfo.entityId,
              action,
              actor_id: user?.id || null,
              actor_role: user?.roles?.[0] || null,
              actor_ip: ip,
              source_module: entityInfo.module,
              new_value: method !== 'DELETE' ? (responseData?.data || responseData || null) : null,
              barangay_id: request.body?.barangay_id || null,
              correlation_id: (request as unknown as Record<string, unknown>).correlationId as string || null,
            },
          });
        } catch (error) {
          // Audit logging should never break the request
          this.logger.error('Failed to write audit log', error);
        }
      }),
    );
  }

  private mapMethodToAction(method: string): 'CREATE' | 'UPDATE' | 'DELETE' {
    switch (method) {
      case 'POST':
        return 'CREATE';
      case 'DELETE':
        return 'DELETE';
      default:
        return 'UPDATE';
    }
  }

  private extractEntityInfo(
    path: string,
    params: Record<string, string>,
    responseData: unknown,
  ): { entityType: string; entityId: string; module: string } {
    // Extract module name from path: /api/v1/barangays/:id -> barangays
    const pathParts = path.replace(/^\/api\/v1\//, '').split('/');
    const module = pathParts[0] || 'unknown';

    // Best-effort entity type from module name (singular form)
    const entityType = module.replace(/s$/, '');

    // Try to get entity ID from params or response
    const entityId =
      params?.id ||
      (responseData as Record<string, unknown>)?.id as string ||
      '00000000-0000-0000-0000-000000000000';

    return { entityType, entityId: String(entityId), module };
  }
}
