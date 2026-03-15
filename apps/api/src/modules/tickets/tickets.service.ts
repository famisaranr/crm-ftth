import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import {
    CreateTicketDto, AssignTicketDto, UpdateTicketStatusDto, AddNoteDto,
} from './dto/ticket.dto';
import { buildPaginationMeta } from '../../common/interfaces/paginated-response';

// SLA hours by priority
const SLA_HOURS: Record<string, number> = {
    P1_CRITICAL: 4,
    P2_HIGH: 8,
    P3_MEDIUM: 24,
    P4_LOW: 72,
};

// Valid status transitions
const VALID_TRANSITIONS: Record<string, string[]> = {
    OPEN: ['ASSIGNED', 'ESCALATED', 'CLOSED'],
    ASSIGNED: ['IN_PROGRESS', 'ESCALATED', 'CLOSED'],
    IN_PROGRESS: ['PENDING_CUSTOMER', 'RESOLVED', 'ESCALATED'],
    PENDING_CUSTOMER: ['IN_PROGRESS', 'RESOLVED', 'CLOSED'],
    RESOLVED: ['CLOSED', 'REOPENED'],
    CLOSED: ['REOPENED'],
    ESCALATED: ['ASSIGNED', 'IN_PROGRESS'],
    REOPENED: ['ASSIGNED', 'IN_PROGRESS'],
};

@Injectable()
export class TicketsService {
    constructor(private readonly prisma: PrismaService) {}

    async create(dto: CreateTicketDto, createdBy?: string) {
        // Generate ticket number
        const count = await this.prisma.serviceTicket.count();
        const ticket_number = `TKT-${String(count + 1).padStart(6, '0')}`;

        // Calculate SLA deadline
        const priority = dto.priority || 'P3_MEDIUM';
        const slaHours = SLA_HOURS[priority] || 24;
        const sla_deadline = new Date(Date.now() + slaHours * 60 * 60 * 1000);

        return this.prisma.serviceTicket.create({
            data: {
                ticket_number,
                subscriber_id: dto.subscriber_id,
                barangay_id: dto.barangay_id,
                category: dto.category as any,
                priority: (dto.priority || 'P3_MEDIUM') as any,
                subject: dto.subject,
                description: dto.description,
                sla_deadline,
                created_by: createdBy,
            },
            include: {
                subscriber: { select: { id: true, account_number: true, full_name: true } },
            },
        });
    }

    async findAll(page = 1, limit = 20, status?: string, barangayId?: string, priority?: string) {
        const take = Math.min(limit, 100);
        const skip = (page - 1) * take;

        const where: Record<string, unknown> = {};
        if (status) where.status = status;
        if (barangayId) where.barangay_id = barangayId;
        if (priority) where.priority = priority;

        const [total, data] = await Promise.all([
            this.prisma.serviceTicket.count({ where: where as any }),
            this.prisma.serviceTicket.findMany({
                where: where as any,
                include: {
                    subscriber: { select: { id: true, account_number: true, full_name: true } },
                    assignments: {
                        orderBy: { created_at: 'desc' },
                        take: 1,
                        include: { assignee: { select: { id: true, full_name: true } } },
                    },
                },
                orderBy: [{ priority: 'asc' }, { created_at: 'desc' }],
                skip,
                take,
            }),
        ]);
        return { data, meta: buildPaginationMeta(total, page, take) };
    }

    async findOne(id: string) {
        const ticket = await this.prisma.serviceTicket.findUnique({
            where: { id },
            include: {
                subscriber: { include: { address: true, barangay: true } },
                assignments: {
                    include: { assignee: { select: { id: true, full_name: true, phone: true } } },
                    orderBy: { created_at: 'desc' },
                },
                notes: { orderBy: { created_at: 'asc' } },
            },
        });
        if (!ticket) throw new NotFoundException('Ticket not found');
        return ticket;
    }

    async assign(id: string, dto: AssignTicketDto, assignedBy?: string) {
        const ticket = await this.prisma.serviceTicket.findUnique({ where: { id } });
        if (!ticket) throw new NotFoundException('Ticket not found');

        // Create assignment record and update status
        await this.prisma.ticketAssignment.create({
            data: {
                ticket_id: id,
                assigned_to: dto.assigned_to,
                assigned_by: assignedBy,
                notes: dto.notes,
            },
        });

        return this.prisma.serviceTicket.update({
            where: { id },
            data: { status: 'ASSIGNED' },
            include: {
                subscriber: { select: { id: true, account_number: true, full_name: true } },
                assignments: {
                    orderBy: { created_at: 'desc' },
                    take: 1,
                    include: { assignee: { select: { id: true, full_name: true } } },
                },
            },
        });
    }

    async updateStatus(id: string, dto: UpdateTicketStatusDto) {
        const ticket = await this.prisma.serviceTicket.findUnique({ where: { id } });
        if (!ticket) throw new NotFoundException('Ticket not found');

        const allowed = VALID_TRANSITIONS[ticket.status] || [];
        if (!allowed.includes(dto.status)) {
            throw new BadRequestException(
                `Invalid status transition: ${ticket.status} → ${dto.status}. Allowed: ${allowed.join(', ')}`,
            );
        }

        const updateData: Record<string, unknown> = { status: dto.status };
        if (dto.status === 'RESOLVED') updateData.resolved_at = new Date();
        if (dto.status === 'CLOSED') updateData.closed_at = new Date();

        // Add optional note
        if (dto.notes) {
            await this.prisma.ticketNote.create({
                data: {
                    ticket_id: id,
                    content: `Status changed to ${dto.status}: ${dto.notes}`,
                    is_internal: true,
                },
            });
        }

        return this.prisma.serviceTicket.update({
            where: { id },
            data: updateData,
            include: {
                subscriber: { select: { id: true, account_number: true, full_name: true } },
            },
        });
    }

    async addNote(id: string, dto: AddNoteDto, authorId?: string) {
        const ticket = await this.prisma.serviceTicket.findUnique({ where: { id } });
        if (!ticket) throw new NotFoundException('Ticket not found');

        return this.prisma.ticketNote.create({
            data: {
                ticket_id: id,
                author_id: authorId,
                content: dto.content,
                is_internal: dto.is_internal ?? true,
            },
        });
    }
}
