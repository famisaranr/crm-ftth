import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { MapsService } from './maps.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';

@Controller('maps')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class MapsController {
    constructor(private readonly mapsService: MapsService) {}

    @Get('topology')
    @Permissions('maps.topology.view')
    topology(@Query('barangay_id') barangayId?: string) {
        return this.mapsService.getTopology(barangayId);
    }

    @Get('coverage')
    @Permissions('maps.coverage.view')
    coverage() {
        return this.mapsService.getCoverage();
    }
}
