import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { DashboardsService } from './dashboards.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';

@Controller('dashboards')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class DashboardsController {
    constructor(private readonly dashboardsService: DashboardsService) {}

    @Get('corporate')
    @Permissions('dashboards.corporate.view')
    getCorporate() {
        return this.dashboardsService.getCorporate();
    }

    @Get('barangay/:id')
    @Permissions('dashboards.barangay.view')
    getBarangay(@Param('id') id: string) {
        return this.dashboardsService.getBarangay(id);
    }

    @Get('network')
    @Permissions('dashboards.network.view')
    getNetwork() {
        return this.dashboardsService.getNetwork();
    }

    @Get('finance')
    @Permissions('dashboards.finance.view')
    getFinance() {
        return this.dashboardsService.getFinance();
    }
}
