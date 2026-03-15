import {
    Controller, Get, Post, Patch, Body, Param, Query,
    UseGuards, UsePipes,
} from '@nestjs/common';
import { InstallationsService } from './installations.service';
import {
    assignTechnicianSchema,
    updateInstallationStatusSchema,
    activateConnectionSchema,
    uploadPhotoSchema,
} from './dto/installation.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('installations')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class InstallationsController {
    constructor(private readonly installationsService: InstallationsService) {}

    @Get()
    @Permissions('installations.job.list')
    findAll(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('status') status?: string,
        @Query('technician_id') technicianId?: string,
    ) {
        return this.installationsService.findAll(
            page ? parseInt(page, 10) : 1,
            limit ? parseInt(limit, 10) : 20,
            status,
            technicianId,
        );
    }

    @Get(':id')
    @Permissions('installations.job.view')
    findOne(@Param('id') id: string) {
        return this.installationsService.findOne(id);
    }

    @Patch(':id/assign')
    @Permissions('installations.job.assign')
    @UsePipes(new ZodValidationPipe(assignTechnicianSchema))
    assign(@Param('id') id: string, @Body() dto: any) {
        return this.installationsService.assignTechnician(id, dto);
    }

    @Patch(':id/status')
    @Permissions('installations.job.update_status')
    @UsePipes(new ZodValidationPipe(updateInstallationStatusSchema))
    updateStatus(@Param('id') id: string, @Body() dto: any) {
        return this.installationsService.updateStatus(id, dto);
    }

    @Patch(':id/activate')
    @Permissions('installations.job.activate')
    @UsePipes(new ZodValidationPipe(activateConnectionSchema))
    activate(@Param('id') id: string, @Body() dto: any) {
        return this.installationsService.activate(id, dto);
    }

    @Post(':id/photos')
    @Permissions('installations.job.update_status')
    @UsePipes(new ZodValidationPipe(uploadPhotoSchema))
    uploadPhoto(@Param('id') id: string, @Body() dto: any, @CurrentUser() user: any) {
        return this.installationsService.uploadPhoto(id, dto, user?.id);
    }
}
