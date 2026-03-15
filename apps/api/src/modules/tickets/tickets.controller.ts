import {
    Controller, Get, Post, Patch, Body, Param, Query,
    UseGuards, UsePipes,
} from '@nestjs/common';
import { TicketsService } from './tickets.service';
import {
    createTicketSchema, assignTicketSchema,
    updateTicketStatusSchema, addNoteSchema,
} from './dto/ticket.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('tickets')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class TicketsController {
    constructor(private readonly ticketsService: TicketsService) {}

    @Post()
    @Permissions('tickets.ticket.create')
    @UsePipes(new ZodValidationPipe(createTicketSchema))
    create(@Body() dto: any, @CurrentUser() user: any) {
        return this.ticketsService.create(dto, user?.id);
    }

    @Get()
    @Permissions('tickets.ticket.list')
    findAll(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('status') status?: string,
        @Query('barangay_id') barangayId?: string,
        @Query('priority') priority?: string,
    ) {
        return this.ticketsService.findAll(
            page ? parseInt(page, 10) : 1,
            limit ? parseInt(limit, 10) : 20,
            status,
            barangayId,
            priority,
        );
    }

    @Get(':id')
    @Permissions('tickets.ticket.view')
    findOne(@Param('id') id: string) {
        return this.ticketsService.findOne(id);
    }

    @Patch(':id/assign')
    @Permissions('tickets.ticket.assign')
    @UsePipes(new ZodValidationPipe(assignTicketSchema))
    assign(@Param('id') id: string, @Body() dto: any, @CurrentUser() user: any) {
        return this.ticketsService.assign(id, dto, user?.id);
    }

    @Patch(':id/status')
    @Permissions('tickets.ticket.update')
    @UsePipes(new ZodValidationPipe(updateTicketStatusSchema))
    updateStatus(@Param('id') id: string, @Body() dto: any) {
        return this.ticketsService.updateStatus(id, dto);
    }

    @Post(':id/notes')
    @Permissions('tickets.ticket.update')
    @UsePipes(new ZodValidationPipe(addNoteSchema))
    addNote(@Param('id') id: string, @Body() dto: any, @CurrentUser() user: any) {
        return this.ticketsService.addNote(id, dto, user?.id);
    }
}
