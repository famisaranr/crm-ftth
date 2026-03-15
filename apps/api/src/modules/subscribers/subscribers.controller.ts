import {
    Controller, Get, Post, Patch, Delete, Body, Param, Query,
    UseGuards, UsePipes,
} from '@nestjs/common';
import { SubscribersService } from './subscribers.service';
import { createSubscriberSchema, updateSubscriberSchema, changeStatusSchema } from './dto/subscriber.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';

@Controller('subscribers')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class SubscribersController {
    constructor(private readonly subscribersService: SubscribersService) {}

    @Post()
    @Permissions('subscribers.subscriber.create')
    @UsePipes(new ZodValidationPipe(createSubscriberSchema))
    create(@Body() dto: any) {
        return this.subscribersService.create(dto);
    }

    @Get()
    @Permissions('subscribers.subscriber.list')
    findAll(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('barangay_id') barangayId?: string,
        @Query('status') status?: string,
        @Query('q') q?: string,
    ) {
        return this.subscribersService.findAll(
            page ? parseInt(page, 10) : 1,
            limit ? parseInt(limit, 10) : 20,
            barangayId,
            status,
            q,
        );
    }

    @Get('search')
    @Permissions('subscribers.subscriber.search')
    search(
        @Query('q') q: string,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        return this.subscribersService.search(
            q,
            page ? parseInt(page, 10) : 1,
            limit ? parseInt(limit, 10) : 20,
        );
    }

    @Get(':id')
    @Permissions('subscribers.subscriber.view')
    findOne(@Param('id') id: string) {
        return this.subscribersService.findOne(id);
    }

    @Patch(':id')
    @Permissions('subscribers.subscriber.update')
    @UsePipes(new ZodValidationPipe(updateSubscriberSchema))
    update(@Param('id') id: string, @Body() dto: any) {
        return this.subscribersService.update(id, dto);
    }

    @Delete(':id')
    @Permissions('subscribers.subscriber.delete')
    remove(@Param('id') id: string) {
        return this.subscribersService.softDelete(id);
    }

    @Patch(':id/status')
    @Permissions('subscribers.subscriber.change_status')
    @UsePipes(new ZodValidationPipe(changeStatusSchema))
    changeStatus(@Param('id') id: string, @Body() dto: any) {
        return this.subscribersService.changeStatus(id, dto);
    }

    @Get(':id/ledger')
    @Permissions('billing.invoice.view')
    getLedger(@Param('id') id: string) {
        return this.subscribersService.getLedger(id);
    }
}
