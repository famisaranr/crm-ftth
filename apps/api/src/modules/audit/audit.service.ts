import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import type { QueryAuditLogsDto } from './dto/audit.dto';
import type { AuthUser } from '../../common/interfaces/auth-user';
import { buildPaginationMeta } from '../../common/interfaces/paginated-response';

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: QueryAuditLogsDto, user: AuthUser) {
    const where: Record<string, unknown> = {};
    const page = query.page || 1;
    const limit = Math.min(query.limit || 20, 100);

    if (query.entity_type) where.entity_type = query.entity_type;
    if (query.entity_id) where.entity_id = query.entity_id;
    if (query.actor_id) where.actor_id = query.actor_id;
    if (query.action) where.action = query.action;

    if (query.start_date || query.end_date) {
      const dateFilter: Record<string, unknown> = {};
      if (query.start_date) dateFilter.gte = new Date(query.start_date);
      if (query.end_date) dateFilter.lte = new Date(query.end_date);
      where.created_at = dateFilter;
    }

    // Tenant isolation: non-cross-barangay users see only their scoped audit logs
    const crossRoles = ['Super Admin', 'Corporate Admin', 'Operations Manager', 'Read-only Executive', 'Auditor'];
    const hasCrossAccess = user.roles.some((r) => crossRoles.includes(r));
    if (!hasCrossAccess && user.scopes.barangay_ids.length > 0) {
      where.barangay_id = { in: user.scopes.barangay_ids };
    }

    const [total, data] = await Promise.all([
      this.prisma.auditLog.count({ where }),
      this.prisma.auditLog.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: {
          actor: { select: { id: true, email: true, full_name: true } },
        },
      }),
    ]);

    return {
      data,
      meta: buildPaginationMeta(total, page, limit),
    };
  }
}
