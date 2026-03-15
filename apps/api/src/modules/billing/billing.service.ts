import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import {
    GenerateInvoicesDto, VoidInvoiceDto, AdjustInvoiceDto,
    CreateBillingCycleDto, ApplyPenaltiesDto,
} from './dto/billing.dto';
import { buildPaginationMeta } from '../../common/interfaces/paginated-response';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class BillingService {
    constructor(private readonly prisma: PrismaService) {}

    // ==================== BILLING CYCLES ====================

    async listCycles(page = 1, limit = 20, barangayId?: string) {
        const take = Math.min(limit, 100);
        const skip = (page - 1) * take;
        const where: Record<string, unknown> = {};
        if (barangayId) where.barangay_id = barangayId;

        const [total, data] = await Promise.all([
            this.prisma.billingCycle.count({ where: where as any }),
            this.prisma.billingCycle.findMany({
                where: where as any,
                include: { barangay: { select: { id: true, name: true } } },
                orderBy: { period_start: 'desc' },
                skip,
                take,
            }),
        ]);
        return { data, meta: buildPaginationMeta(total, page, take) };
    }

    async createCycle(dto: CreateBillingCycleDto, userId?: string) {
        const existing = await this.prisma.billingCycle.findFirst({
            where: {
                barangay_id: dto.barangay_id,
                period_start: new Date(dto.period_start),
            },
        });
        if (existing) {
            throw new BadRequestException('Billing cycle already exists for this barangay and period');
        }

        return this.prisma.billingCycle.create({
            data: {
                barangay_id: dto.barangay_id,
                period_start: new Date(dto.period_start),
                period_end: new Date(dto.period_end),
                created_by: userId,
            },
            include: { barangay: { select: { id: true, name: true } } },
        });
    }

    async generateInvoices(cycleId: string, dto: GenerateInvoicesDto) {
        const cycle = await this.prisma.billingCycle.findUnique({ where: { id: cycleId } });
        if (!cycle) throw new NotFoundException('Billing cycle not found');
        if (cycle.status !== 'PENDING') {
            throw new BadRequestException('Can only generate invoices for PENDING cycles');
        }

        // Mark cycle as generating
        await this.prisma.billingCycle.update({
            where: { id: cycleId },
            data: { status: 'GENERATING' },
        });

        try {
            // Get active subscribers with plan promos for discount application
            const subscribers = await this.prisma.subscriber.findMany({
                where: {
                    barangay_id: cycle.barangay_id,
                    status: 'ACTIVE',
                    deleted_at: null,
                },
                include: {
                    subscriptions: {
                        where: { status: 'ACTIVE' },
                        include: {
                            plan: {
                                include: {
                                    promos: {
                                        where: {
                                            status: 'ACTIVE',
                                            valid_from: { lte: cycle.period_end },
                                            OR: [
                                                { valid_to: null },
                                                { valid_to: { gte: cycle.period_start } },
                                            ],
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            });

            let invoiceCount = 0;
            const dueDateStr = dto.due_date || new Date(cycle.period_end.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
            const dueDate = new Date(dueDateStr);
            const cycleDays = this.daysBetween(cycle.period_start, cycle.period_end);

            for (const sub of subscribers) {
                if (sub.subscriptions.length === 0) continue;

                let totalAmount = new Decimal(0);
                const lines: Array<{
                    line_type: string;
                    description: string;
                    amount: Decimal;
                    quantity: number;
                    total: Decimal;
                }> = [];

                for (const subscription of sub.subscriptions) {
                    const monthlyFee = subscription.plan.monthly_fee;

                    // --- Proration: mid-cycle activation ---
                    const subStart = new Date(subscription.start_date);
                    let chargeAmount: Decimal;
                    let chargeDesc: string;
                    let lineType: string;

                    if (subStart > cycle.period_start && subStart <= cycle.period_end) {
                        const activeDays = this.daysBetween(subStart, cycle.period_end);
                        chargeAmount = monthlyFee.mul(activeDays).div(cycleDays).toDecimalPlaces(2);
                        chargeDesc = `${subscription.plan.name} - Prorated (${activeDays}/${cycleDays} days)`;
                        lineType = 'PRORATE_CHARGE';
                    } else {
                        chargeAmount = monthlyFee;
                        chargeDesc = `${subscription.plan.name} - Monthly`;
                        lineType = 'MONTHLY_CHARGE';
                    }

                    totalAmount = totalAmount.add(chargeAmount);
                    lines.push({
                        line_type: lineType,
                        description: chargeDesc,
                        amount: chargeAmount,
                        quantity: 1,
                        total: chargeAmount,
                    });

                    // --- Promo discounts ---
                    for (const promo of (subscription.plan as any).promos || []) {
                        let discountAmount: Decimal;
                        if (promo.discount_percentage) {
                            discountAmount = chargeAmount.mul(new Decimal(promo.discount_percentage)).div(100).toDecimalPlaces(2);
                        } else if (promo.discount_amount) {
                            discountAmount = new Decimal(promo.discount_amount);
                        } else {
                            continue;
                        }

                        if (discountAmount.gt(chargeAmount)) {
                            discountAmount = chargeAmount;
                        }

                        totalAmount = totalAmount.sub(discountAmount);
                        lines.push({
                            line_type: 'PROMO_DISCOUNT',
                            description: `Promo: ${promo.name} (-${promo.discount_percentage ? new Decimal(promo.discount_percentage).toFixed(0) + '%' : '₱' + new Decimal(promo.discount_amount).toFixed(2)})`,
                            amount: discountAmount.neg(),
                            quantity: 1,
                            total: discountAmount.neg(),
                        });
                    }
                }

                if (totalAmount.lt(0)) totalAmount = new Decimal(0);

                // Generate invoice number
                const invCount = await this.prisma.invoice.count();
                const invoice_number = `INV-${String(invCount + 1).padStart(6, '0')}`;

                // Create invoice with lines
                const invoice = await this.prisma.invoice.create({
                    data: {
                        invoice_number,
                        subscriber_id: sub.id,
                        billing_cycle_id: cycleId,
                        barangay_id: cycle.barangay_id,
                        total_amount: totalAmount,
                        due_date: dueDate,
                        status: 'GENERATED',
                        issued_at: new Date(),
                        lines: {
                            create: lines.map((l) => ({
                                line_type: l.line_type as any,
                                description: l.description,
                                amount: l.amount,
                                quantity: l.quantity,
                                total: l.total,
                            })),
                        },
                    },
                });

                // Create CHARGE ledger entry
                const lastEntry = await this.prisma.accountLedgerEntry.findFirst({
                    where: { subscriber_id: sub.id },
                    orderBy: { created_at: 'desc' },
                });
                const prevBalance = lastEntry ? lastEntry.balance_after : new Decimal(0);

                await this.prisma.accountLedgerEntry.create({
                    data: {
                        subscriber_id: sub.id,
                        entry_type: 'CHARGE',
                        amount: totalAmount,
                        balance_after: prevBalance.add(totalAmount),
                        reference_id: invoice.id,
                        reference_type: 'INVOICE',
                        description: `Invoice ${invoice_number}`,
                    },
                });

                invoiceCount++;
            }

            // Mark cycle as completed
            await this.prisma.billingCycle.update({
                where: { id: cycleId },
                data: {
                    status: 'COMPLETED',
                    generated_at: new Date(),
                    invoice_count: invoiceCount,
                },
            });

            return { cycle_id: cycleId, invoices_generated: invoiceCount };
        } catch (error) {
            await this.prisma.billingCycle.update({
                where: { id: cycleId },
                data: { status: 'FAILED' },
            });
            throw error;
        }
    }

    // ==================== INVOICES ====================

    async listInvoices(page = 1, limit = 20, subscriberId?: string, status?: string, barangayId?: string) {
        const take = Math.min(limit, 100);
        const skip = (page - 1) * take;
        const where: Record<string, unknown> = {};
        if (subscriberId) where.subscriber_id = subscriberId;
        if (status) where.status = status;
        if (barangayId) where.barangay_id = barangayId;

        const [total, data] = await Promise.all([
            this.prisma.invoice.count({ where: where as any }),
            this.prisma.invoice.findMany({
                where: where as any,
                include: {
                    subscriber: { select: { id: true, account_number: true, full_name: true } },
                },
                orderBy: { created_at: 'desc' },
                skip,
                take,
            }),
        ]);
        return { data, meta: buildPaginationMeta(total, page, take) };
    }

    async getInvoice(id: string) {
        const invoice = await this.prisma.invoice.findUnique({
            where: { id },
            include: {
                subscriber: { select: { id: true, account_number: true, full_name: true } },
                billing_cycle: true,
                lines: true,
                payments: true,
                adjustments: true,
                write_offs: true,
            },
        });
        if (!invoice) throw new NotFoundException('Invoice not found');
        return invoice;
    }

    async voidInvoice(id: string, dto: VoidInvoiceDto, userId?: string) {
        const invoice = await this.prisma.invoice.findUnique({ where: { id } });
        if (!invoice) throw new NotFoundException('Invoice not found');
        if (invoice.status === 'VOIDED') throw new BadRequestException('Invoice already voided');
        if (invoice.status === 'PAID') throw new BadRequestException('Cannot void a paid invoice');

        // Void invoice + create reversal ledger entry
        const updated = await this.prisma.invoice.update({
            where: { id },
            data: { status: 'VOIDED' },
        });

        // Create reversal ledger entry
        const lastEntry = await this.prisma.accountLedgerEntry.findFirst({
            where: { subscriber_id: invoice.subscriber_id },
            orderBy: { created_at: 'desc' },
        });
        const prevBalance = lastEntry ? lastEntry.balance_after : new Decimal(0);

        await this.prisma.accountLedgerEntry.create({
            data: {
                subscriber_id: invoice.subscriber_id,
                entry_type: 'REVERSAL',
                amount: invoice.total_amount.neg(),
                balance_after: prevBalance.sub(invoice.total_amount),
                reference_id: id,
                reference_type: 'INVOICE_VOID',
                description: `Voided: ${dto.reason}`,
                created_by: userId,
            },
        });

        return updated;
    }

    async adjustInvoice(id: string, dto: AdjustInvoiceDto, userId?: string) {
        const invoice = await this.prisma.invoice.findUnique({ where: { id } });
        if (!invoice) throw new NotFoundException('Invoice not found');
        if (['VOIDED', 'PAID', 'WRITTEN_OFF'].includes(invoice.status)) {
            throw new BadRequestException(`Cannot adjust a ${invoice.status} invoice`);
        }

        const amount = new Decimal(dto.amount);
        const adjustmentAmount = dto.type === 'CREDIT' ? amount.neg() : amount;

        // Create adjustment record
        await this.prisma.adjustment.create({
            data: {
                invoice_id: id,
                type: dto.type,
                amount,
                reason: dto.reason,
                created_by: userId,
            },
        });

        // Update invoice total
        const newTotal = invoice.total_amount.add(adjustmentAmount);
        const updated = await this.prisma.invoice.update({
            where: { id },
            data: { total_amount: newTotal },
            include: { lines: true, adjustments: true },
        });

        // Create ledger entry
        const lastEntry = await this.prisma.accountLedgerEntry.findFirst({
            where: { subscriber_id: invoice.subscriber_id },
            orderBy: { created_at: 'desc' },
        });
        const prevBalance = lastEntry ? lastEntry.balance_after : new Decimal(0);

        await this.prisma.accountLedgerEntry.create({
            data: {
                subscriber_id: invoice.subscriber_id,
                entry_type: dto.type === 'CREDIT' ? 'ADJUSTMENT_CREDIT' : 'ADJUSTMENT_DEBIT',
                amount: adjustmentAmount,
                balance_after: prevBalance.add(adjustmentAmount),
                reference_id: id,
                reference_type: 'ADJUSTMENT',
                description: `${dto.type}: ${dto.reason}`,
                created_by: userId,
            },
        });

        return updated;
    }

    // ==================== LATE PENALTIES ====================

    async applyPenalties(dto: ApplyPenaltiesDto, userId?: string) {
        const [penaltyRateSetting, penaltyGraceSetting] = await Promise.all([
            this.prisma.systemSetting.findUnique({ where: { key: 'billing.late_penalty_rate' } }),
            this.prisma.systemSetting.findUnique({ where: { key: 'billing.late_penalty_grace_days' } }),
        ]);

        const penaltyRate = new Decimal(penaltyRateSetting?.value || '0.05'); // 5% default
        const graceDays = parseInt(penaltyGraceSetting?.value || '7', 10);
        const cutoffDate = new Date(Date.now() - graceDays * 24 * 60 * 60 * 1000);

        const where: Record<string, unknown> = {
            status: { in: ['GENERATED', 'SENT', 'OVERDUE', 'PARTIALLY_PAID'] },
            due_date: { lt: cutoffDate },
        };
        if (dto.barangay_id) where.barangay_id = dto.barangay_id;

        const overdueInvoices = await this.prisma.invoice.findMany({
            where: where as any,
            include: {
                lines: { where: { line_type: 'PENALTY' } },
                subscriber: { select: { id: true, account_number: true } },
            },
        });

        let penaltiesApplied = 0;

        for (const invoice of overdueInvoices) {
            const existingPenalties = invoice.lines
                .reduce((sum, l) => sum.add(l.total.abs()), new Decimal(0));
            const baseAmount = invoice.total_amount.sub(existingPenalties);
            const penaltyAmount = baseAmount.mul(penaltyRate).toDecimalPlaces(2);

            if (penaltyAmount.lte(0)) continue;

            await this.prisma.invoiceLine.create({
                data: {
                    invoice_id: invoice.id,
                    line_type: 'PENALTY',
                    description: `Late payment penalty (${penaltyRate.mul(100)}%)`,
                    amount: penaltyAmount,
                    quantity: 1,
                    total: penaltyAmount,
                },
            });

            const newTotal = invoice.total_amount.add(penaltyAmount);
            await this.prisma.invoice.update({
                where: { id: invoice.id },
                data: { total_amount: newTotal, status: 'OVERDUE' },
            });

            // PENALTY ledger entry
            const lastEntry = await this.prisma.accountLedgerEntry.findFirst({
                where: { subscriber_id: invoice.subscriber_id },
                orderBy: { created_at: 'desc' },
            });
            const prevBalance = lastEntry ? lastEntry.balance_after : new Decimal(0);

            await this.prisma.accountLedgerEntry.create({
                data: {
                    subscriber_id: invoice.subscriber_id,
                    entry_type: 'PENALTY',
                    amount: penaltyAmount,
                    balance_after: prevBalance.add(penaltyAmount),
                    reference_id: invoice.id,
                    reference_type: 'PENALTY',
                    description: `Late penalty on ${invoice.invoice_number}`,
                    created_by: userId,
                },
            });

            penaltiesApplied++;
        }

        return { penalties_applied: penaltiesApplied, penalty_rate: penaltyRate.toFixed(4) };
    }

    // ==================== AGING REPORT ====================

    async getAgingReport(barangayId?: string) {
        const now = new Date();
        const day30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const day60 = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
        const day90 = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

        const where: Record<string, unknown> = {
            status: { in: ['GENERATED', 'SENT', 'OVERDUE', 'PARTIALLY_PAID'] },
        };
        if (barangayId) where.barangay_id = barangayId;

        const invoices = await this.prisma.invoice.findMany({
            where: where as any,
            include: {
                subscriber: { select: { id: true, account_number: true, full_name: true } },
            },
            orderBy: { due_date: 'asc' },
        });

        const buckets = {
            current: [] as typeof invoices,
            days_30: [] as typeof invoices,
            days_60: [] as typeof invoices,
            days_90: [] as typeof invoices,
            days_120_plus: [] as typeof invoices,
        };

        for (const inv of invoices) {
            const outstanding = inv.total_amount.sub(inv.amount_paid);
            if (outstanding.lte(0)) continue;

            if (inv.due_date >= now) {
                buckets.current.push(inv);
            } else if (inv.due_date >= day30) {
                buckets.days_30.push(inv);
            } else if (inv.due_date >= day60) {
                buckets.days_60.push(inv);
            } else if (inv.due_date >= day90) {
                buckets.days_90.push(inv);
            } else {
                buckets.days_120_plus.push(inv);
            }
        }

        const sumBucket = (items: typeof invoices) =>
            items.reduce((sum, inv) => sum.add(inv.total_amount.sub(inv.amount_paid)), new Decimal(0));

        return {
            summary: {
                current: { count: buckets.current.length, total: sumBucket(buckets.current).toFixed(2) },
                days_30: { count: buckets.days_30.length, total: sumBucket(buckets.days_30).toFixed(2) },
                days_60: { count: buckets.days_60.length, total: sumBucket(buckets.days_60).toFixed(2) },
                days_90: { count: buckets.days_90.length, total: sumBucket(buckets.days_90).toFixed(2) },
                days_120_plus: { count: buckets.days_120_plus.length, total: sumBucket(buckets.days_120_plus).toFixed(2) },
                grand_total: sumBucket(invoices).toFixed(2),
            },
            invoices: invoices
                .filter(inv => inv.total_amount.sub(inv.amount_paid).gt(0))
                .map(inv => ({
                    id: inv.id,
                    invoice_number: inv.invoice_number,
                    subscriber: inv.subscriber,
                    total_amount: inv.total_amount.toFixed(2),
                    amount_paid: inv.amount_paid.toFixed(2),
                    outstanding: inv.total_amount.sub(inv.amount_paid).toFixed(2),
                    due_date: inv.due_date,
                    days_overdue: Math.max(0, Math.floor((now.getTime() - inv.due_date.getTime()) / (24 * 60 * 60 * 1000))),
                    status: inv.status,
                })),
        };
    }

    // ==================== HELPERS ====================

    private daysBetween(start: Date, end: Date): number {
        return Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000)));
    }
}
