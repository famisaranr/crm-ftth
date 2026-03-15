import {
    Controller, Get, Post, Patch, Body, Param, Query,
    UseGuards, UsePipes,
} from '@nestjs/common';
import { BillingService } from './billing.service';
import {
    createBillingCycleSchema, generateInvoicesSchema,
    voidInvoiceSchema, adjustInvoiceSchema, applyPenaltiesSchema,
} from './dto/billing.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('billing')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class BillingController {
    constructor(private readonly billingService: BillingService) {}

    // ==================== CYCLES ====================

    @Get('cycles')
    @Permissions('billing.cycle.list')
    listCycles(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('barangay_id') barangayId?: string,
    ) {
        return this.billingService.listCycles(
            page ? parseInt(page, 10) : 1,
            limit ? parseInt(limit, 10) : 20,
            barangayId,
        );
    }

    @Post('cycles')
    @Permissions('billing.cycle.manage')
    @UsePipes(new ZodValidationPipe(createBillingCycleSchema))
    createCycle(@Body() dto: any, @CurrentUser() user: any) {
        return this.billingService.createCycle(dto, user?.id);
    }

    @Post('cycles/:id/generate')
    @Permissions('billing.cycle.manage')
    @UsePipes(new ZodValidationPipe(generateInvoicesSchema))
    generateInvoices(@Param('id') id: string, @Body() dto: any) {
        return this.billingService.generateInvoices(id, dto);
    }

    // ==================== PENALTIES ====================

    @Post('penalties/apply')
    @Permissions('billing.invoice.adjust')
    @UsePipes(new ZodValidationPipe(applyPenaltiesSchema))
    applyPenalties(@Body() dto: any, @CurrentUser() user: any) {
        return this.billingService.applyPenalties(dto, user?.id);
    }

    // ==================== AGING REPORT ====================

    @Get('aging')
    @Permissions('billing.invoice.list')
    getAgingReport(@Query('barangay_id') barangayId?: string) {
        return this.billingService.getAgingReport(barangayId);
    }

    // ==================== INVOICES ====================

    @Get('invoices')
    @Permissions('billing.invoice.list')
    listInvoices(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('subscriber_id') subscriberId?: string,
        @Query('status') status?: string,
        @Query('barangay_id') barangayId?: string,
    ) {
        return this.billingService.listInvoices(
            page ? parseInt(page, 10) : 1,
            limit ? parseInt(limit, 10) : 20,
            subscriberId,
            status,
            barangayId,
        );
    }

    @Get('invoices/:id')
    @Permissions('billing.invoice.view')
    getInvoice(@Param('id') id: string) {
        return this.billingService.getInvoice(id);
    }

    @Patch('invoices/:id/void')
    @Permissions('billing.invoice.void')
    @UsePipes(new ZodValidationPipe(voidInvoiceSchema))
    voidInvoice(@Param('id') id: string, @Body() dto: any, @CurrentUser() user: any) {
        return this.billingService.voidInvoice(id, dto, user?.id);
    }

    @Post('invoices/:id/adjust')
    @Permissions('billing.invoice.adjust')
    @UsePipes(new ZodValidationPipe(adjustInvoiceSchema))
    adjustInvoice(@Param('id') id: string, @Body() dto: any, @CurrentUser() user: any) {
        return this.billingService.adjustInvoice(id, dto, user?.id);
    }
}
