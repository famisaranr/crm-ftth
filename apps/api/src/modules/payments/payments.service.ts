import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { PostPaymentDto, ReversePaymentDto } from './dto/payment.dto';
import { buildPaginationMeta } from '../../common/interfaces/paginated-response';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class PaymentsService {
    constructor(private readonly prisma: PrismaService) {}

    async listPayments(page = 1, limit = 20, subscriberId?: string, barangayId?: string) {
        const take = Math.min(limit, 100);
        const skip = (page - 1) * take;
        const where: Record<string, unknown> = { reversed_at: null };
        if (subscriberId) where.subscriber_id = subscriberId;
        if (barangayId) where.barangay_id = barangayId;

        const [total, data] = await Promise.all([
            this.prisma.payment.count({ where: where as any }),
            this.prisma.payment.findMany({
                where: where as any,
                include: {
                    subscriber: { select: { id: true, account_number: true, full_name: true } },
                    invoice: { select: { id: true, invoice_number: true, status: true } },
                },
                orderBy: { posted_at: 'desc' },
                skip,
                take,
            }),
        ]);
        return { data, meta: buildPaginationMeta(total, page, take) };
    }

    async postPayment(dto: PostPaymentDto, postedBy: string) {
        const amount = new Decimal(dto.amount);

        // Create payment record
        const payment = await this.prisma.payment.create({
            data: {
                invoice_id: dto.invoice_id,
                subscriber_id: dto.subscriber_id,
                barangay_id: dto.barangay_id,
                amount,
                method: dto.method as any,
                receipt_reference: dto.receipt_reference,
                notes: dto.notes,
                posted_by: postedBy,
            },
            include: {
                subscriber: { select: { id: true, account_number: true, full_name: true } },
            },
        });

        // If linked to an invoice, update invoice amount_paid and status
        if (dto.invoice_id) {
            const invoice = await this.prisma.invoice.findUnique({ where: { id: dto.invoice_id } });
            if (invoice) {
                const newAmountPaid = invoice.amount_paid.add(amount);
                let newStatus = invoice.status;
                if (newAmountPaid.gte(invoice.total_amount)) {
                    newStatus = 'PAID';
                } else if (newAmountPaid.gt(0)) {
                    newStatus = 'PARTIALLY_PAID';
                }

                await this.prisma.invoice.update({
                    where: { id: dto.invoice_id },
                    data: { amount_paid: newAmountPaid, status: newStatus as any },
                });
            }
        }

        // Create PAYMENT ledger entry
        const lastEntry = await this.prisma.accountLedgerEntry.findFirst({
            where: { subscriber_id: dto.subscriber_id },
            orderBy: { created_at: 'desc' },
        });
        const prevBalance = lastEntry ? lastEntry.balance_after : new Decimal(0);

        await this.prisma.accountLedgerEntry.create({
            data: {
                subscriber_id: dto.subscriber_id,
                entry_type: 'PAYMENT',
                amount: amount.neg(),
                balance_after: prevBalance.sub(amount),
                reference_id: payment.id,
                reference_type: 'PAYMENT',
                description: `Payment via ${dto.method}${dto.receipt_reference ? ` (${dto.receipt_reference})` : ''}`,
                created_by: postedBy,
            },
        });

        return payment;
    }

    async reversePayment(id: string, dto: ReversePaymentDto, reversedBy?: string) {
        const payment = await this.prisma.payment.findUnique({ where: { id } });
        if (!payment) throw new NotFoundException('Payment not found');
        if (payment.reversed_at) throw new BadRequestException('Payment already reversed');

        // Mark payment as reversed
        const reversed = await this.prisma.payment.update({
            where: { id },
            data: {
                reversed_at: new Date(),
                reversal_reason: dto.reason,
            },
        });

        // If linked to invoice, reduce amount_paid
        if (payment.invoice_id) {
            const invoice = await this.prisma.invoice.findUnique({ where: { id: payment.invoice_id } });
            if (invoice) {
                const newAmountPaid = invoice.amount_paid.sub(payment.amount);
                let newStatus = invoice.status;
                if (newAmountPaid.lte(0)) {
                    newStatus = invoice.due_date < new Date() ? 'OVERDUE' : 'GENERATED';
                } else {
                    newStatus = 'PARTIALLY_PAID';
                }

                await this.prisma.invoice.update({
                    where: { id: payment.invoice_id },
                    data: { amount_paid: newAmountPaid.lt(0) ? new Decimal(0) : newAmountPaid, status: newStatus as any },
                });
            }
        }

        // Create REVERSAL ledger entry
        const lastEntry = await this.prisma.accountLedgerEntry.findFirst({
            where: { subscriber_id: payment.subscriber_id },
            orderBy: { created_at: 'desc' },
        });
        const prevBalance = lastEntry ? lastEntry.balance_after : new Decimal(0);

        await this.prisma.accountLedgerEntry.create({
            data: {
                subscriber_id: payment.subscriber_id,
                entry_type: 'REVERSAL',
                amount: payment.amount,
                balance_after: prevBalance.add(payment.amount),
                reference_id: id,
                reference_type: 'PAYMENT_REVERSAL',
                description: `Reversal: ${dto.reason}`,
                created_by: reversedBy,
            },
        });

        return reversed;
    }
}
