import {
    Controller, Get, Post, Patch, Delete, Body, Param, Query,
    UseGuards, UsePipes,
} from '@nestjs/common';
import { NetworkAssetsService } from './network-assets.service';
import { createNetworkAssetSchema, updateNetworkAssetSchema } from './dto/network-asset.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';

@Controller('network')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class NetworkAssetsController {
    constructor(private readonly networkAssetsService: NetworkAssetsService) {}

    @Post('assets')
    @Permissions('network.asset.create')
    @UsePipes(new ZodValidationPipe(createNetworkAssetSchema))
    create(@Body() dto: any) {
        return this.networkAssetsService.create(dto);
    }

    @Get('assets')
    @Permissions('network.asset.list')
    findAll(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('barangay_id') barangayId?: string,
        @Query('asset_type_id') assetTypeId?: string,
        @Query('status') status?: string,
    ) {
        return this.networkAssetsService.findAll(
            page ? parseInt(page, 10) : 1,
            limit ? parseInt(limit, 10) : 20,
            barangayId,
            assetTypeId,
            status,
        );
    }

    @Get('topology')
    @Permissions('network.topology.view')
    getTopology(@Query('barangay_id') barangayId?: string) {
        return this.networkAssetsService.getTopology(barangayId);
    }

    @Get('assets/:id')
    @Permissions('network.asset.view')
    findOne(@Param('id') id: string) {
        return this.networkAssetsService.findOne(id);
    }

    @Patch('assets/:id')
    @Permissions('network.asset.update')
    @UsePipes(new ZodValidationPipe(updateNetworkAssetSchema))
    update(@Param('id') id: string, @Body() dto: any) {
        return this.networkAssetsService.update(id, dto);
    }

    @Delete('assets/:id')
    @Permissions('network.asset.delete')
    remove(@Param('id') id: string) {
        return this.networkAssetsService.softDelete(id);
    }
}
