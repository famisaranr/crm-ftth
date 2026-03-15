import { Test, TestingModule } from '@nestjs/testing';
import { ReportsService } from '../../src/modules/reports/reports.service';
import { PrismaService } from '../../src/database/prisma.service';
import { createMockPrismaService } from '../helpers/mock-prisma';
import { Decimal } from '@prisma/client/runtime/library';

describe('ReportsService', () => {
    let service: ReportsService;
    let prisma: ReturnType<typeof createMockPrismaService>;

    beforeEach(async () => {
        prisma = createMockPrismaService();
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ReportsService,
                { provide: PrismaService, useValue: prisma },
            ],
        }).compile();
        service = module.get<ReportsService>(ReportsService);
    });

    describe('revenueByBarangay', () => {
        it('should aggregate payments by barangay with percentages', async () => {
            prisma.payment.groupBy.mockResolvedValue([
                { barangay_id: 'brgy-1', _sum: { amount: new Decimal(30000) }, _count: { id: 20 } },
                { barangay_id: 'brgy-2', _sum: { amount: new Decimal(20000) }, _count: { id: 10 } },
            ]);
            prisma.barangay.findMany.mockResolvedValue([
                { id: 'brgy-1', name: 'Poblacion' },
                { id: 'brgy-2', name: 'San Jose' },
            ]);

            const result = await service.revenueByBarangay();

            expect(result.total_revenue).toBe('50000.00');
            expect(result.breakdown).toHaveLength(2);
            expect(result.breakdown[0].barangay_name).toBe('Poblacion');
            expect(result.breakdown[0].revenue).toBe('30000.00');
            expect(result.breakdown[0].share_pct).toBe('60.0');
        });
    });

    describe('revenueByPartner', () => {
        it('should aggregate settlements by partner', async () => {
            prisma.settlement.findMany.mockResolvedValue([
                {
                    gross_revenue: new Decimal(50000),
                    partner_share: new Decimal(15000),
                    operator_share: new Decimal(35000),
                    agreement: {
                        partner: { id: 'p-1', company_name: 'Del Rosario' },
                        barangay: { id: 'brgy-1', name: 'Poblacion' },
                    },
                },
            ]);

            const result = await service.revenueByPartner();

            expect(result.partners).toHaveLength(1);
            expect(result.partners[0].company_name).toBe('Del Rosario');
            expect(result.partners[0].gross_revenue).toBe('50000.00');
            expect(result.partners[0].partner_share).toBe('15000.00');
        });
    });
});
