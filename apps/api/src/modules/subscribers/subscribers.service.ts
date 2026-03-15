import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateSubscriberDto, UpdateSubscriberDto, ChangeStatusDto } from './dto/subscriber.dto';
import { buildPaginationMeta } from '../../common/interfaces/paginated-response';

@Injectable()
export class SubscribersService {
    constructor(private readonly prisma: PrismaService) {}

    async create(dto: CreateSubscriberDto) {
        const { address, ...subscriberData } = dto;

        // Generate account number: BRGY-<short_id>-<seq>
        const barangay = await this.prisma.barangay.findUnique({
            where: { id: subscriberData.barangay_id },
        });
        if (!barangay) throw new NotFoundException('Barangay not found');

        const count = await this.prisma.subscriber.count({
            where: { barangay_id: subscriberData.barangay_id },
        });
        const brgyCode = barangay.name.substring(0, 4).toUpperCase().replace(/\s/g, '');
        const account_number = `${brgyCode}-${String(count + 1).padStart(5, '0')}`;

        return this.prisma.subscriber.create({
            data: {
                ...subscriberData,
                account_number,
                address: address ? { create: address } : undefined,
            },
            include: { address: true, barangay: true },
        });
    }

    async findAll(page = 1, limit = 20, barangayId?: string, status?: string, q?: string) {
        const take = Math.min(limit, 100);
        const skip = (page - 1) * take;

        const where: Record<string, unknown> = { deleted_at: null };
        if (barangayId) where.barangay_id = barangayId;
        if (status) where.status = status;
        if (q) {
            where.OR = [
                { full_name: { contains: q, mode: 'insensitive' } },
                { account_number: { contains: q, mode: 'insensitive' } },
                { phone: { contains: q } },
                { email: { contains: q, mode: 'insensitive' } },
            ];
        }

        const [total, data] = await Promise.all([
            this.prisma.subscriber.count({ where: where as any }),
            this.prisma.subscriber.findMany({
                where: where as any,
                include: { barangay: true, address: true },
                orderBy: { created_at: 'desc' },
                skip,
                take,
            }),
        ]);
        return { data, meta: buildPaginationMeta(total, page, take) };
    }

    async findOne(id: string) {
        const subscriber = await this.prisma.subscriber.findFirst({
            where: { id, deleted_at: null },
            include: {
                barangay: true,
                address: true,
                subscriptions: { include: { plan: true } },
                service_tickets: { where: { status: { not: 'CLOSED' } }, take: 5 },
                installation_jobs: { orderBy: { created_at: 'desc' }, take: 1 },
            },
        });
        if (!subscriber) throw new NotFoundException('Subscriber not found');
        return subscriber;
    }

    async update(id: string, dto: UpdateSubscriberDto) {
        const existing = await this.prisma.subscriber.findFirst({ where: { id, deleted_at: null } });
        if (!existing) throw new NotFoundException('Subscriber not found');

        const { address, ...subscriberData } = dto;

        return this.prisma.subscriber.update({
            where: { id },
            data: {
                ...subscriberData,
                address: address ? {
                    upsert: {
                        create: address,
                        update: address,
                    },
                } : undefined,
            },
            include: { address: true, barangay: true },
        });
    }

    async softDelete(id: string) {
        const existing = await this.prisma.subscriber.findFirst({ where: { id, deleted_at: null } });
        if (!existing) throw new NotFoundException('Subscriber not found');

        return this.prisma.subscriber.update({
            where: { id },
            data: { deleted_at: new Date() },
        });
    }

    async changeStatus(id: string, dto: ChangeStatusDto) {
        const existing = await this.prisma.subscriber.findFirst({ where: { id, deleted_at: null } });
        if (!existing) throw new NotFoundException('Subscriber not found');

        return this.prisma.subscriber.update({
            where: { id },
            data: { status: dto.status as any },
            include: { barangay: true },
        });
    }

    async search(q: string, page = 1, limit = 20) {
        return this.findAll(page, limit, undefined, undefined, q);
    }

    async getLedger(id: string, page = 1, limit = 50) {
        const existing = await this.prisma.subscriber.findFirst({ where: { id, deleted_at: null } });
        if (!existing) throw new NotFoundException('Subscriber not found');

        const take = Math.min(limit, 100);
        const skip = (page - 1) * take;

        const [total, entries] = await Promise.all([
            this.prisma.accountLedgerEntry.count({ where: { subscriber_id: id } }),
            this.prisma.accountLedgerEntry.findMany({
                where: { subscriber_id: id },
                orderBy: { created_at: 'desc' },
                skip,
                take,
            }),
        ]);

        // Get current balance (latest entry)
        const latest = entries.length > 0 ? entries[0] : null;
        const balance = latest ? latest.balance_after.toFixed(2) : '0.00';

        return {
            subscriber_id: id,
            balance,
            entries,
            meta: buildPaginationMeta(total, page, take),
        };
    }
}
