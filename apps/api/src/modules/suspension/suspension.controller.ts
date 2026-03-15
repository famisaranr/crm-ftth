import {
    Controller, Get, Post, Body, Param, Query,
    UseGuards, UsePipes,
} from '@nestjs/common';
import { SuspensionService } from './suspension.service';
import { overrideSuspensionSchema } from './dto/suspension.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('billing/suspensions')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class SuspensionController {
    constructor(private readonly suspensionService: SuspensionService) {}

    @Get()
    @Permissions('billing.suspension.view')
    getQueue(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        return this.suspensionService.getSuspensionQueue(
            page ? parseInt(page, 10) : 1,
            limit ? parseInt(limit, 10) : 20,
        );
    }

    @Post('execute-bulk')
    @Permissions('billing.suspension.override')
    executeBulk(@CurrentUser() user: any) {
        return this.suspensionService.executeBulk(user?.id);
    }

    @Post(':id/override')
    @Permissions('billing.suspension.override')
    @UsePipes(new ZodValidationPipe(overrideSuspensionSchema))
    override(@Param('id') id: string, @Body() dto: any, @CurrentUser() user: any) {
        return this.suspensionService.override(id, dto, user?.id);
    }
}
