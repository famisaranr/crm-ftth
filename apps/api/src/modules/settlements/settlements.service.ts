import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateSettlementDto } from './dto/settlement.dto';
import { buildPaginationMeta } from '../../common/interfaces/paginated-response';
import { Decimal } from '@prisma/client/runtime/library';

// Valid settlement status transitions
const VALID_TRANSITIONS: Record<string, string[]> = {
    DRAFTED: ['CALCULATED'],
    CALCULATED: ['UNDER_REVIEW'],
    UNDER_REVIEW: ['APPROVED', 'DISPUTED'],
    APPROVED: ['DISBURSED'],
    DISBURSED: ['LOCKED'],
    DISPUTED: ['UNDER_REVIEW'],
};

@Injectable()
export class SettlementsService {
    constructor(private readonly prisma: PrismaService) {}

    async list(page = 1, limit = 20, agreementId?: string, status?: string) {
        const take = Math.min(limit, 100);
        const skip = (page - 1) * take;
        const where: Record<string, unknown> = {};
        if (agreementId) where.agreement_id = agreementId;
        if (status) where.status = status;

        const [total, data] = await Promise.all([
            this.prisma.settlement.count({ where: where as any }),
            this.prisma.settlement.findMany({
                where: where as any,
                include: {
                    agreement: {
                        include: {
                            partner: { select: { id: true, company_name: true } },
                            barangay: { select: { id: true, name: true } },
                        },
                    },
                },
                orderBy: { period_start: 'desc' },
                skip,
                take,
            }),
        ]);
        return { data, meta: buildPaginationMeta(total, page, take) };
    }

    async findOne(id: string) {
        const settlement = await this.prisma.settlement.findUnique({
            where: { id },
            include: {
                agreement: {
                    include: {
                        partner: { select: { id: true, company_name: true } },
                        barangay: { select: { id: true, name: true } },
                        revenue_share_rules: true,
                    },
                },
                lines: true,
                adjustments: true,
                statement: true,
            },
        });
        if (!settlement) throw new NotFoundException('Settlement not found');
        return settlement;
    }

    async createAndCalculate(dto: CreateSettlementDto, userId?: string) {
        // Validate agreement exists
        const agreement = await this.prisma.partnerAgreement.findUnique({
            where: { id: dto.agreement_id },
            include: {
                revenue_share_rules: true,
                barangay: { select: { id: true, name: true } },
                partner: { select: { id: true, company_name: true } },
            },
        });
        if (!agreement) throw new NotFoundException('Partner agreement not found');
        if (agreement.status !== 'ACTIVE') {
            throw new BadRequestException('Agreement must be ACTIVE to create settlement');
        }

        const periodStart = new Date(dto.period_start);
        const periodEnd = new Date(dto.period_end);

        // Check for duplicate settlement period
        const existing = await this.prisma.settlement.findFirst({
            where: {
                agreement_id: dto.agreement_id,
                period_start: periodStart,
            },
        });
        if (existing) throw new BadRequestException('Settlement already exists for this period');

        // ========== REVENUE SHARE CALCULATION ==========
        // Get all non-reversed payments in the barangay for the period
        const payments = await this.prisma.payment.findMany({
            where: {
                barangay_id: agreement.barangay_id,
                reversed_at: null,
                posted_at: {
                    gte: periodStart,
                    lte: periodEnd,
                },
            },
        });

        const grossRevenue = payments.reduce(
            (sum, p) => sum.add(p.amount),
            new Decimal(0),
        );

        // Apply revenue share rules
        const shareRule = agreement.revenue_share_rules[0]; // Primary rule
        let partnerPercentage = new Decimal(0);
        let totalDeductions = new Decimal(0);
        let netRevenue = grossRevenue;

        if (shareRule) {
            partnerPercentage = shareRule.partner_percentage;

            if (shareRule.share_type === 'NET') {
                // Deductions from buckets (e.g., opex, maintenance)
                if (shareRule.deduction_buckets && typeof shareRule.deduction_buckets === 'object') {
                    const buckets = shareRule.deduction_buckets as Record<string, number>;
                    for (const [, pct] of Object.entries(buckets)) {
                        totalDeductions = totalDeductions.add(grossRevenue.mul(new Decimal(pct).div(100)));
                    }
                }
                netRevenue = grossRevenue.sub(totalDeductions);
            }
        }

        const partnerShare = netRevenue.mul(partnerPercentage);
        const operatorShare = netRevenue.sub(partnerShare);

        // Create settlement lines (per-payment breakdown grouped by subscriber)
        const subscriberTotals: Record<string, { name: string; total: Decimal; count: number }> = {};
        for (const payment of payments) {
            const sub = await this.prisma.subscriber.findUnique({
                where: { id: payment.subscriber_id },
                select: { full_name: true },
            });
            if (!subscriberTotals[payment.subscriber_id]) {
                subscriberTotals[payment.subscriber_id] = {
                    name: sub?.full_name || 'Unknown',
                    total: new Decimal(0),
                    count: 0,
                };
            }
            subscriberTotals[payment.subscriber_id].total = subscriberTotals[payment.subscriber_id].total.add(payment.amount);
            subscriberTotals[payment.subscriber_id].count++;
        }

        const lines = Object.entries(subscriberTotals).map(([, info]) => ({
            description: `Collections - ${info.name}`,
            category: 'SUBSCRIBER_PAYMENT',
            quantity: info.count,
            unit_amount: info.total.div(info.count),
            total_amount: info.total,
        }));

        // Create settlement with lines
        const settlement = await this.prisma.settlement.create({
            data: {
                agreement_id: dto.agreement_id,
                period_start: periodStart,
                period_end: periodEnd,
                status: 'CALCULATED',
                gross_revenue: grossRevenue,
                total_deductions: totalDeductions,
                net_revenue: netRevenue,
                partner_share: partnerShare,
                operator_share: operatorShare,
                calculated_at: new Date(),
                notes: dto.notes,
                created_by: userId,
                lines: {
                    create: lines,
                },
            },
            include: {
                agreement: {
                    include: {
                        partner: { select: { id: true, company_name: true } },
                        barangay: { select: { id: true, name: true } },
                    },
                },
                lines: true,
            },
        });

        return settlement;
    }

    // ==================== WORKFLOW TRANSITIONS ====================

    private async transition(id: string, targetStatus: string, extras: Record<string, unknown> = {}) {
        const settlement = await this.prisma.settlement.findUnique({ where: { id } });
        if (!settlement) throw new NotFoundException('Settlement not found');

        const allowed = VALID_TRANSITIONS[settlement.status] || [];
        if (!allowed.includes(targetStatus)) {
            throw new BadRequestException(
                `Cannot transition from ${settlement.status} to ${targetStatus}. Allowed: ${allowed.join(', ')}`,
            );
        }

        return this.prisma.settlement.update({
            where: { id },
            data: { status: targetStatus as any, ...extras },
            include: {
                agreement: {
                    include: {
                        partner: { select: { id: true, company_name: true } },
                    },
                },
            },
        });
    }

    async submit(id: string, notes?: string) {
        return this.transition(id, 'UNDER_REVIEW', { notes });
    }

    async approve(id: string, userId?: string, notes?: string) {
        return this.transition(id, 'APPROVED', {
            approved_by: userId,
            approved_at: new Date(),
            notes,
        });
    }

    async disburse(id: string, notes?: string) {
        return this.transition(id, 'DISBURSED', {
            disbursed_at: new Date(),
            notes,
        });
    }

    async lock(id: string, notes?: string) {
        return this.transition(id, 'LOCKED', {
            locked_at: new Date(),
            notes,
        });
    }

    // ==================== PARTNER STATEMENT ====================

    async getStatement(id: string) {
        const settlement = await this.prisma.settlement.findUnique({
            where: { id },
            include: {
                agreement: {
                    include: {
                        partner: true,
                        barangay: { select: { id: true, name: true } },
                        revenue_share_rules: true,
                    },
                },
                lines: true,
                adjustments: true,
                statement: true,
            },
        });
        if (!settlement) throw new NotFoundException('Settlement not found');

        // If statement already generated, return it
        if (settlement.statement) {
            return settlement.statement;
        }

        // Generate statement
        const stmtCount = await this.prisma.partnerStatement.count();
        const statement_number = `STMT-${String(stmtCount + 1).padStart(6, '0')}`;

        const statementData = {
            partner: settlement.agreement.partner,
            barangay: settlement.agreement.barangay,
            period: {
                start: settlement.period_start,
                end: settlement.period_end,
            },
            financials: {
                gross_revenue: settlement.gross_revenue.toFixed(2),
                total_deductions: settlement.total_deductions.toFixed(2),
                net_revenue: settlement.net_revenue.toFixed(2),
                partner_share: settlement.partner_share.toFixed(2),
                operator_share: settlement.operator_share.toFixed(2),
            },
            lines: settlement.lines.map((l) => ({
                description: l.description,
                category: l.category,
                quantity: l.quantity,
                unit_amount: l.unit_amount.toFixed(2),
                total: l.total_amount.toFixed(2),
            })),
            adjustments: settlement.adjustments.map((a) => ({
                type: a.type,
                amount: a.amount.toFixed(2),
                reason: a.reason,
            })),
            generated_at: new Date().toISOString(),
            settlement_status: settlement.status,
        };

        const statement = await this.prisma.partnerStatement.create({
            data: {
                settlement_id: id,
                statement_number,
                data: statementData,
            },
        });

        return statement;
    }
}
