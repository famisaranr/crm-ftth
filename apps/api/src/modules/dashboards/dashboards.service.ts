import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class DashboardsService {
    constructor(private readonly prisma: PrismaService) {}

    async getCorporate() {
        const [
            totalSubscribers,
            activeSubscribers,
            prospectSubscribers,
            openTickets,
            installPipeline,
            totalAssets,
        ] = await Promise.all([
            this.prisma.subscriber.count({ where: { deleted_at: null } }),
            this.prisma.subscriber.count({ where: { status: 'ACTIVE', deleted_at: null } }),
            this.prisma.subscriber.count({ where: { status: 'PROSPECT', deleted_at: null } }),
            this.prisma.serviceTicket.count({ where: { status: { notIn: ['CLOSED', 'RESOLVED'] } } }),
            this.prisma.installationJob.groupBy({
                by: ['status'],
                _count: { id: true },
                where: { status: { notIn: ['BILLING_STARTED', 'CANCELLED'] } },
            }),
            this.prisma.networkAsset.count({ where: { status: { not: 'DECOMMISSIONED' } } }),
        ]);

        return {
            subscribers: {
                total: totalSubscribers,
                active: activeSubscribers,
                prospects: prospectSubscribers,
            },
            tickets: { open: openTickets },
            installations: {
                pipeline: installPipeline.map((g) => ({
                    status: g.status,
                    count: g._count.id,
                })),
            },
            network: { total_assets: totalAssets },
        };
    }

    async getBarangay(barangayId: string) {
        const where = { barangay_id: barangayId };

        const [
            totalSubscribers,
            activeSubscribers,
            openTickets,
            totalAssets,
        ] = await Promise.all([
            this.prisma.subscriber.count({ where: { ...where, deleted_at: null } }),
            this.prisma.subscriber.count({ where: { ...where, status: 'ACTIVE', deleted_at: null } }),
            this.prisma.serviceTicket.count({ where: { ...where, status: { notIn: ['CLOSED', 'RESOLVED'] } } }),
            this.prisma.networkAsset.count({ where: { ...where, status: { not: 'DECOMMISSIONED' } } }),
        ]);

        return {
            barangay_id: barangayId,
            subscribers: { total: totalSubscribers, active: activeSubscribers },
            tickets: { open: openTickets },
            network: { total_assets: totalAssets },
        };
    }

    async getNetwork() {
        const [assetsByType, assetsByStatus] = await Promise.all([
            this.prisma.networkAsset.groupBy({
                by: ['asset_type_id'],
                _count: { id: true },
                where: { status: { not: 'DECOMMISSIONED' } },
            }),
            this.prisma.networkAsset.groupBy({
                by: ['status'],
                _count: { id: true },
            }),
        ]);

        // Resolve type names
        const typeIds = assetsByType.map((g) => g.asset_type_id);
        const types = await this.prisma.networkAssetType.findMany({
            where: { id: { in: typeIds } },
        });
        const typeMap = new Map(types.map((t) => [t.id, t.name]));

        return {
            by_type: assetsByType.map((g) => ({
                type: typeMap.get(g.asset_type_id) || g.asset_type_id,
                count: g._count.id,
            })),
            by_status: assetsByStatus.map((g) => ({
                status: g.status,
                count: g._count.id,
            })),
        };
    }

    async getFinance() {
        const [
            totalInvoices,
            paidInvoices,
            overdueInvoices,
            totalPayments,
            totalRevenue,
            totalOutstanding,
        ] = await Promise.all([
            this.prisma.invoice.count({ where: { status: { not: 'VOIDED' } } }),
            this.prisma.invoice.count({ where: { status: 'PAID' } }),
            this.prisma.invoice.count({ where: { status: 'OVERDUE' } }),
            this.prisma.payment.count({ where: { reversed_at: null } }),
            this.prisma.payment.aggregate({
                where: { reversed_at: null },
                _sum: { amount: true },
            }),
            this.prisma.invoice.aggregate({
                where: { status: { in: ['GENERATED', 'SENT', 'PARTIALLY_PAID', 'OVERDUE'] } },
                _sum: { total_amount: true },
                _count: { id: true },
            }),
        ]);

        const revenue = totalRevenue._sum.amount ? totalRevenue._sum.amount.toFixed(2) : '0.00';
        const outstanding = totalOutstanding._sum.total_amount
            ? totalOutstanding._sum.total_amount.toFixed(2) : '0.00';
        const collectionRate = totalInvoices > 0
            ? ((paidInvoices / totalInvoices) * 100).toFixed(1) : '0.0';

        return {
            invoices: { total: totalInvoices, paid: paidInvoices, overdue: overdueInvoices },
            payments: { count: totalPayments, total_revenue: revenue },
            accounts_receivable: { total_outstanding: outstanding, overdue_count: overdueInvoices },
            collection_rate: `${collectionRate}%`,
        };
    }
}
