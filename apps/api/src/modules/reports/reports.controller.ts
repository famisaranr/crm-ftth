import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';

@Controller('reports')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class ReportsController {
    constructor(private readonly reportsService: ReportsService) {}

    @Get('revenue-barangay')
    @Permissions('reports.report.view')
    revenueByBarangay(
        @Query('period_start') periodStart?: string,
        @Query('period_end') periodEnd?: string,
    ) {
        return this.reportsService.revenueByBarangay(periodStart, periodEnd);
    }

    @Get('revenue-partner')
    @Permissions('reports.report.view')
    revenueByPartner(
        @Query('period_start') periodStart?: string,
        @Query('period_end') periodEnd?: string,
    ) {
        return this.reportsService.revenueByPartner(periodStart, periodEnd);
    }
}
