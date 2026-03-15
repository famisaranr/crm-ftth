import {
    Controller, Get, Post, Body, Param, Query,
    UseGuards, UsePipes,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { postPaymentSchema, reversePaymentSchema } from './dto/payment.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('billing/payments')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class PaymentsController {
    constructor(private readonly paymentsService: PaymentsService) {}

    @Get()
    @Permissions('billing.payment.list')
    list(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('subscriber_id') subscriberId?: string,
        @Query('barangay_id') barangayId?: string,
    ) {
        return this.paymentsService.listPayments(
            page ? parseInt(page, 10) : 1,
            limit ? parseInt(limit, 10) : 20,
            subscriberId,
            barangayId,
        );
    }

    @Post()
    @Permissions('billing.payment.post')
    @UsePipes(new ZodValidationPipe(postPaymentSchema))
    post(@Body() dto: any, @CurrentUser() user: any) {
        return this.paymentsService.postPayment(dto, user?.id);
    }

    @Post(':id/reverse')
    @Permissions('billing.payment.reverse')
    @UsePipes(new ZodValidationPipe(reversePaymentSchema))
    reverse(@Param('id') id: string, @Body() dto: any, @CurrentUser() user: any) {
        return this.paymentsService.reversePayment(id, dto, user?.id);
    }
}
