import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class ReportsService {
    constructor(private readonly prisma: PrismaService) {}

    async revenueByBarangay(periodStart?: string, periodEnd?: string) {
        const where: Record<string, unknown> = { reversed_at: null };
        if (periodStart || periodEnd) {
            where.posted_at = {};
            if (periodStart) (where.posted_at as any).gte = new Date(periodStart);
            if (periodEnd) (where.posted_at as any).lte = new Date(periodEnd);
        }

        // Group payments by barangay
        const grouped = await this.prisma.payment.groupBy({
            by: ['barangay_id'],
            where: where as any,
            _sum: { amount: true },
            _count: { id: true },
        });

        // Resolve barangay names
        const barangayIds = grouped.map((g) => g.barangay_id);
        const barangays = await this.prisma.barangay.findMany({
            where: { id: { in: barangayIds } },
            select: { id: true, name: true },
        });
        const nameMap = new Map(barangays.map((b) => [b.id, b.name]));

        // Calculate total for percentages
        const totalRevenue = grouped.reduce((sum, g) => sum + Number(g._sum.amount || 0), 0);

        return {
            period: { start: periodStart || 'all', end: periodEnd || 'all' },
            total_revenue: totalRevenue.toFixed(2),
            breakdown: grouped
                .map((g) => ({
                    barangay_id: g.barangay_id,
                    barangay_name: nameMap.get(g.barangay_id) || 'Unknown',
                    revenue: Number(g._sum.amount || 0).toFixed(2),
                    payment_count: g._count.id,
                    share_pct: totalRevenue > 0
                        ? ((Number(g._sum.amount || 0) / totalRevenue) * 100).toFixed(1)
                        : '0.0',
                }))
                .sort((a, b) => parseFloat(b.revenue) - parseFloat(a.revenue)),
        };
    }

    async revenueByPartner(periodStart?: string, periodEnd?: string) {
        const where: Record<string, unknown> = {};
        if (periodStart || periodEnd) {
            where.period_start = {};
            if (periodStart) (where.period_start as any).gte = new Date(periodStart);
            if (periodEnd) (where.period_start as any).lte = new Date(periodEnd);
        }

        // Get settlements grouped by partner via agreement
        const settlements = await this.prisma.settlement.findMany({
            where: { ...where, status: { in: ['APPROVED', 'DISBURSED', 'LOCKED'] } } as any,
            include: {
                agreement: {
                    include: {
                        partner: { select: { id: true, company_name: true } },
                        barangay: { select: { id: true, name: true } },
                    },
                },
            },
        });

        // Group by partner
        const partnerMap: Record<string, {
            company_name: string;
            gross_revenue: number;
            partner_share: number;
            operator_share: number;
            settlement_count: number;
            barangays: Set<string>;
        }> = {};

        for (const s of settlements) {
            const pid = s.agreement.partner.id;
            if (!partnerMap[pid]) {
                partnerMap[pid] = {
                    company_name: s.agreement.partner.company_name,
                    gross_revenue: 0,
                    partner_share: 0,
                    operator_share: 0,
                    settlement_count: 0,
                    barangays: new Set(),
                };
            }
            partnerMap[pid].gross_revenue += Number(s.gross_revenue);
            partnerMap[pid].partner_share += Number(s.partner_share);
            partnerMap[pid].operator_share += Number(s.operator_share);
            partnerMap[pid].settlement_count++;
            partnerMap[pid].barangays.add(s.agreement.barangay.name);
        }

        return {
            period: { start: periodStart || 'all', end: periodEnd || 'all' },
            partners: Object.entries(partnerMap)
                .map(([id, info]) => ({
                    partner_id: id,
                    company_name: info.company_name,
                    gross_revenue: info.gross_revenue.toFixed(2),
                    partner_share: info.partner_share.toFixed(2),
                    operator_share: info.operator_share.toFixed(2),
                    settlement_count: info.settlement_count,
                    barangay_count: info.barangays.size,
                    barangays: Array.from(info.barangays),
                }))
                .sort((a, b) => parseFloat(b.gross_revenue) - parseFloat(a.gross_revenue)),
        };
    }
}
