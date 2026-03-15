import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuditService } from './audit.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { QueryAuditLogsDto } from './dto/audit.dto';
import type { AuthUser } from '../../common/interfaces/auth-user';

@Controller('audit-logs')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @Permissions('audit.log.list')
  findAll(@Query() query: QueryAuditLogsDto, @CurrentUser() user: AuthUser) {
    return this.auditService.findAll(query, user);
  }
}
