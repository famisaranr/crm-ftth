import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { OverrideSuspensionDto } from './dto/suspension.dto';
import { buildPaginationMeta } from '../../common/interfaces/paginated-response';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class SuspensionService {
    constructor(private readonly prisma: PrismaService) {}

    async getSuspensionQueue(page = 1, limit = 20) {
        const take = Math.min(limit, 100);
        const skip = (page - 1) * take;

        const softDaysSetting = await this.prisma.systemSetting.findUnique({
            where: { key: 'billing.auto_suspend_days' },
        });
        const softDays = softDaysSetting ? parseInt(softDaysSetting.value, 10) : 30;
        const cutoffDate = new Date(Date.now() - softDays * 24 * 60 * 60 * 1000);

        const where = {
            status: { in: ['ACTIVE', 'SUSPENDED_SOFT'] },
            deleted_at: null,
            invoices: {
                some: {
                    status: { in: ['GENERATED', 'SENT', 'OVERDUE', 'PARTIALLY_PAID'] },
                    due_date: { lt: cutoffDate },
                },
            },
        };

        const [total, data] = await Promise.all([
            this.prisma.subscriber.count({ where: where as any }),
            this.prisma.subscriber.findMany({
                where: where as any,
                include: {
                    barangay: { select: { id: true, name: true } },
                    invoices: {
                        where: {
                            status: { in: ['GENERATED', 'SENT', 'OVERDUE', 'PARTIALLY_PAID'] },
                            due_date: { lt: cutoffDate },
                        },
                        select: {
                            id: true,
                            invoice_number: true,
                            total_amount: true,
                            amount_paid: true,
                            due_date: true,
                            status: true,
                        },
                    },
                    suspension_actions: {
                        orderBy: { created_at: 'desc' },
                        take: 1,
                    },
                },
                orderBy: { created_at: 'asc' },
                skip,
                take,
            }),
        ]);

        const enriched = data.map((sub) => {
            const overdueInvoices = sub.invoices;
            const totalOverdue = overdueInvoices.reduce(
                (acc, inv) => acc.add(inv.total_amount.sub(inv.amount_paid)),
                new Decimal(0),
            );
            const oldestDue = overdueInvoices.length > 0
                ? overdueInvoices.reduce((oldest, inv) =>
                    inv.due_date < oldest ? inv.due_date : oldest, overdueInvoices[0].due_date)
                : null;
            const overdueDays = oldestDue
                ? Math.floor((Date.now() - oldestDue.getTime()) / (24 * 60 * 60 * 1000))
                : 0;

            return {
                ...sub,
                overdue_summary: {
                    total_overdue: totalOverdue.toFixed(2),
                    overdue_days: overdueDays,
                    overdue_invoice_count: overdueInvoices.length,
                },
            };
        });

        return { data: enriched, meta: buildPaginationMeta(total, page, take) };
    }

    // ==================== BULK EXECUTION ====================

    async executeBulk(performedBy?: string) {
        const [softDaysSetting, hardDaysSetting] = await Promise.all([
            this.prisma.systemSetting.findUnique({ where: { key: 'billing.auto_suspend_days' } }),
            this.prisma.systemSetting.findUnique({ where: { key: 'billing.hard_suspend_days' } }),
        ]);

        const softDays = softDaysSetting ? parseInt(softDaysSetting.value, 10) : 30;
        const hardDays = hardDaysSetting ? parseInt(hardDaysSetting.value, 10) : 60;
        const softCutoff = new Date(Date.now() - softDays * 24 * 60 * 60 * 1000);
        const hardCutoff = new Date(Date.now() - hardDays * 24 * 60 * 60 * 1000);

        let softSuspended = 0;
        let hardEscalated = 0;

        // --- Escalate SUSPENDED_SOFT → SUSPENDED_HARD ---
        const softSubs = await this.prisma.subscriber.findMany({
            where: {
                status: 'SUSPENDED_SOFT' as any,
                deleted_at: null,
                invoices: {
                    some: {
                        status: { in: ['GENERATED', 'SENT', 'OVERDUE', 'PARTIALLY_PAID'] },
                        due_date: { lt: hardCutoff },
                    },
                },
            },
            include: {
                invoices: {
                    where: {
                        status: { in: ['GENERATED', 'SENT', 'OVERDUE', 'PARTIALLY_PAID'] },
                        due_date: { lt: hardCutoff },
                    },
                    select: { total_amount: true, amount_paid: true, due_date: true },
                },
            },
        });

        for (const sub of softSubs) {
            const totalOverdue = sub.invoices.reduce(
                (acc, inv) => acc.add(inv.total_amount.sub(inv.amount_paid)), new Decimal(0),
            );
            const oldestDue = sub.invoices.reduce(
                (oldest, inv) => inv.due_date < oldest ? inv.due_date : oldest, sub.invoices[0].due_date,
            );
            const overdueDays = Math.floor((Date.now() - oldestDue.getTime()) / (24 * 60 * 60 * 1000));

            await this.prisma.subscriber.update({
                where: { id: sub.id },
                data: { status: 'SUSPENDED_HARD' as any },
            });

            await this.prisma.suspensionAction.create({
                data: {
                    subscriber_id: sub.id,
                    action_type: 'SUSPENDED',
                    suspension_type: 'HARD',
                    reason: `Auto-escalated: ${overdueDays} days overdue (threshold: ${hardDays})`,
                    overdue_days: overdueDays,
                    overdue_amount: totalOverdue,
                    performed_by: performedBy,
                },
            });

            hardEscalated++;
        }

        // --- Soft suspend ACTIVE subscribers ---
        const activeSubs = await this.prisma.subscriber.findMany({
            where: {
                status: 'ACTIVE' as any,
                deleted_at: null,
                invoices: {
                    some: {
                        status: { in: ['GENERATED', 'SENT', 'OVERDUE', 'PARTIALLY_PAID'] },
                        due_date: { lt: softCutoff },
                    },
                },
            },
            include: {
                invoices: {
                    where: {
                        status: { in: ['GENERATED', 'SENT', 'OVERDUE', 'PARTIALLY_PAID'] },
                        due_date: { lt: softCutoff },
                    },
                    select: { total_amount: true, amount_paid: true, due_date: true },
                },
            },
        });

        for (const sub of activeSubs) {
            const totalOverdue = sub.invoices.reduce(
                (acc, inv) => acc.add(inv.total_amount.sub(inv.amount_paid)), new Decimal(0),
            );
            const oldestDue = sub.invoices.reduce(
                (oldest, inv) => inv.due_date < oldest ? inv.due_date : oldest, sub.invoices[0].due_date,
            );
            const overdueDays = Math.floor((Date.now() - oldestDue.getTime()) / (24 * 60 * 60 * 1000));

            await this.prisma.subscriber.update({
                where: { id: sub.id },
                data: { status: 'SUSPENDED_SOFT' as any },
            });

            await this.prisma.suspensionAction.create({
                data: {
                    subscriber_id: sub.id,
                    action_type: 'SUSPENDED',
                    suspension_type: 'SOFT',
                    reason: `Auto-suspended: ${overdueDays} days overdue (threshold: ${softDays})`,
                    overdue_days: overdueDays,
                    overdue_amount: totalOverdue,
                    performed_by: performedBy,
                },
            });

            softSuspended++;
        }

        return {
            soft_suspended: softSuspended,
            hard_escalated: hardEscalated,
            total_actions: softSuspended + hardEscalated,
        };
    }

    // ==================== OVERRIDE (manual) ====================

    async override(subscriberId: string, dto: OverrideSuspensionDto, performedBy?: string) {
        const subscriber = await this.prisma.subscriber.findFirst({
            where: { id: subscriberId, deleted_at: null },
        });
        if (!subscriber) throw new NotFoundException('Subscriber not found');

        let newStatus = subscriber.status;
        let actionType: string;
        let suspensionType: string | null = null;

        switch (dto.action) {
            case 'FORCE_SUSPEND':
                newStatus = 'SUSPENDED_HARD';
                actionType = 'SUSPENDED';
                suspensionType = 'HARD';
                break;
            case 'REACTIVATE':
                newStatus = 'ACTIVE';
                actionType = 'REACTIVATED';
                break;
            case 'SKIP':
                actionType = 'MANUAL_OVERRIDE';
                break;
            default:
                actionType = 'MANUAL_OVERRIDE';
        }

        // Update subscriber status
        if (newStatus !== subscriber.status) {
            await this.prisma.subscriber.update({
                where: { id: subscriberId },
                data: { status: newStatus as any },
            });
        }

        // Create suspension action record
        const action = await this.prisma.suspensionAction.create({
            data: {
                subscriber_id: subscriberId,
                action_type: actionType as any,
                suspension_type: suspensionType as any,
                reason: dto.reason,
                performed_by: performedBy,
            },
        });

        // --- Reactivation fee (on REACTIVATE from SUSPENDED_HARD) ---
        if (dto.action === 'REACTIVATE' && subscriber.status === 'SUSPENDED_HARD') {
            const reactivationFeeSetting = await this.prisma.systemSetting.findUnique({
                where: { key: 'billing.reactivation_fee' },
            });
            const feeAmount = new Decimal(reactivationFeeSetting?.value || '0');

            if (feeAmount.gt(0)) {
                // Find or create a current invoice for the fee
                const invCount = await this.prisma.invoice.count();
                const invoiceNumber = `INV-${String(invCount + 1).padStart(6, '0')}`;
                const dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

                const invoice = await this.prisma.invoice.create({
                    data: {
                        invoice_number: invoiceNumber,
                        subscriber_id: subscriberId,
                        barangay_id: subscriber.barangay_id,
                        total_amount: feeAmount,
                        due_date: dueDate,
                        status: 'GENERATED',
                        issued_at: new Date(),
                        lines: {
                            create: [{
                                line_type: 'REACTIVATION_FEE' as any,
                                description: 'Reactivation fee',
                                amount: feeAmount,
                                quantity: 1,
                                total: feeAmount,
                            }],
                        },
                    },
                });

                // Create ledger entry
                const lastEntry = await this.prisma.accountLedgerEntry.findFirst({
                    where: { subscriber_id: subscriberId },
                    orderBy: { created_at: 'desc' },
                });
                const prevBalance = lastEntry ? lastEntry.balance_after : new Decimal(0);

                await this.prisma.accountLedgerEntry.create({
                    data: {
                        subscriber_id: subscriberId,
                        entry_type: 'REACTIVATION_FEE',
                        amount: feeAmount,
                        balance_after: prevBalance.add(feeAmount),
                        reference_id: invoice.id,
                        reference_type: 'INVOICE',
                        description: `Reactivation fee - ${invoiceNumber}`,
                        created_by: performedBy,
                    },
                });
            }
        }

        return action;
    }
}
