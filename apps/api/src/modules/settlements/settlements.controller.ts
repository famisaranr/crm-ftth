import {
    Controller, Get, Post, Patch, Body, Param, Query,
    UseGuards, UsePipes,
} from '@nestjs/common';
import { SettlementsService } from './settlements.service';
import {
    createSettlementSchema,
    submitSettlementSchema,
    approveSettlementSchema,
    disburseSettlementSchema,
    lockSettlementSchema,
} from './dto/settlement.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('settlements')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class SettlementsController {
    constructor(private readonly settlementsService: SettlementsService) {}

    @Get()
    @Permissions('settlements.settlement.list')
    list(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('agreement_id') agreementId?: string,
        @Query('status') status?: string,
    ) {
        return this.settlementsService.list(
            page ? parseInt(page, 10) : 1,
            limit ? parseInt(limit, 10) : 20,
            agreementId,
            status,
        );
    }

    @Get(':id')
    @Permissions('settlements.settlement.view')
    findOne(@Param('id') id: string) {
        return this.settlementsService.findOne(id);
    }

    @Post()
    @Permissions('settlements.settlement.calculate')
    @UsePipes(new ZodValidationPipe(createSettlementSchema))
    create(@Body() dto: any, @CurrentUser() user: any) {
        return this.settlementsService.createAndCalculate(dto, user?.id);
    }

    @Patch(':id/submit')
    @Permissions('settlements.settlement.submit')
    @UsePipes(new ZodValidationPipe(submitSettlementSchema))
    submit(@Param('id') id: string, @Body() dto: any) {
        return this.settlementsService.submit(id, dto?.notes);
    }

    @Patch(':id/approve')
    @Permissions('settlements.settlement.approve')
    @UsePipes(new ZodValidationPipe(approveSettlementSchema))
    approve(@Param('id') id: string, @Body() dto: any, @CurrentUser() user: any) {
        return this.settlementsService.approve(id, user?.id, dto?.notes);
    }

    @Patch(':id/disburse')
    @Permissions('settlements.settlement.disburse')
    @UsePipes(new ZodValidationPipe(disburseSettlementSchema))
    disburse(@Param('id') id: string, @Body() dto: any) {
        return this.settlementsService.disburse(id, dto?.notes);
    }

    @Patch(':id/lock')
    @Permissions('settlements.settlement.lock')
    @UsePipes(new ZodValidationPipe(lockSettlementSchema))
    lock(@Param('id') id: string, @Body() dto: any) {
        return this.settlementsService.lock(id, dto?.notes);
    }

    @Get(':id/statement')
    @Permissions('settlements.statement.view')
    statement(@Param('id') id: string) {
        return this.settlementsService.getStatement(id);
    }
}
