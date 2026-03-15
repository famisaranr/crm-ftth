import { Test, TestingModule } from '@nestjs/testing';
import { SettlementsService } from '../../src/modules/settlements/settlements.service';
import { PrismaService } from '../../src/database/prisma.service';
import { createMockPrismaService } from '../helpers/mock-prisma';
import { Decimal } from '@prisma/client/runtime/library';

describe('SettlementsService', () => {
    let service: SettlementsService;
    let prisma: ReturnType<typeof createMockPrismaService>;

    beforeEach(async () => {
        prisma = createMockPrismaService();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                SettlementsService,
                { provide: PrismaService, useValue: prisma },
            ],
        }).compile();

        service = module.get<SettlementsService>(SettlementsService);
    });

    describe('createAndCalculate', () => {
        it('should calculate NET revenue share correctly (E2E-004)', async () => {
            // Setup: 30% NET share with 10% deductions
            const agreement = {
                id: 'agr-1',
                status: 'ACTIVE',
                barangay_id: 'brgy-1',
                revenue_share_rules: [{
                    share_type: 'NET',
                    partner_percentage: new Decimal(0.30),
                    deduction_buckets: { opex: 10 },
                }],
                barangay: { id: 'brgy-1', name: 'Poblacion' },
                partner: { id: 'p-1', company_name: 'Del Rosario Co' },
            };

            const payments = [
                { id: 'pmt-1', subscriber_id: 'sub-1', amount: new Decimal(25000) },
                { id: 'pmt-2', subscriber_id: 'sub-2', amount: new Decimal(25000) },
            ];

            prisma.partnerAgreement.findUnique.mockResolvedValue(agreement);
            prisma.settlement.findFirst.mockResolvedValue(null); // No duplicate
            prisma.payment.findMany.mockResolvedValue(payments);
            prisma.subscriber.findUnique.mockResolvedValue({ full_name: 'Test Sub' });
            prisma.settlement.create.mockImplementation(({ data }: any) => {
                // Verify calculations
                expect(data.gross_revenue.toFixed(2)).toBe('50000.00');
                expect(data.total_deductions.toFixed(2)).toBe('5000.00'); // 10% of 50k
                expect(data.net_revenue.toFixed(2)).toBe('45000.00');
                expect(data.partner_share.toFixed(2)).toBe('13500.00'); // 30% of 45k
                expect(data.operator_share.toFixed(2)).toBe('31500.00'); // 70% of 45k

                // Verify partner_share + operator_share = net_revenue
                const partnerShare = data.partner_share;
                const operatorShare = data.operator_share;
                const netRevenue = data.net_revenue;
                expect(partnerShare.add(operatorShare).toFixed(2)).toBe(netRevenue.toFixed(2));

                return { id: 'stl-1', ...data, agreement, lines: [] };
            });

            await service.createAndCalculate({
                agreement_id: 'agr-1',
                period_start: '2026-03-01',
                period_end: '2026-03-31',
            });

            expect(prisma.settlement.create).toHaveBeenCalled();
        });

        it('should reject duplicate settlement period', async () => {
            prisma.partnerAgreement.findUnique.mockResolvedValue({
                id: 'agr-1', status: 'ACTIVE', revenue_share_rules: [],
                barangay: {}, partner: {},
            });
            prisma.settlement.findFirst.mockResolvedValue({ id: 'existing' });

            await expect(
                service.createAndCalculate({
                    agreement_id: 'agr-1',
                    period_start: '2026-03-01',
                    period_end: '2026-03-31',
                }),
            ).rejects.toThrow('Settlement already exists');
        });

        it('should reject inactive agreement', async () => {
            prisma.partnerAgreement.findUnique.mockResolvedValue({
                id: 'agr-1', status: 'DRAFT', revenue_share_rules: [],
                barangay: {}, partner: {},
            });

            await expect(
                service.createAndCalculate({
                    agreement_id: 'agr-1',
                    period_start: '2026-03-01',
                    period_end: '2026-03-31',
                }),
            ).rejects.toThrow('Agreement must be ACTIVE');
        });
    });

    describe('workflow transitions', () => {
        it('should allow CALCULATED → UNDER_REVIEW', async () => {
            prisma.settlement.findUnique.mockResolvedValue({
                id: 'stl-1', status: 'CALCULATED',
            });
            prisma.settlement.update.mockResolvedValue({
                id: 'stl-1', status: 'UNDER_REVIEW',
                agreement: { partner: { id: 'p-1', company_name: 'Test' } },
            });

            const result = await service.submit('stl-1', 'Ready for review');
            expect(prisma.settlement.update).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({ status: 'UNDER_REVIEW' }),
                }),
            );
        });

        it('should reject DRAFTED → APPROVED (invalid transition)', async () => {
            prisma.settlement.findUnique.mockResolvedValue({
                id: 'stl-1', status: 'DRAFTED',
            });

            await expect(service.approve('stl-1', 'user-1')).rejects.toThrow(
                /Cannot transition/,
            );
        });

        it('should allow full approval workflow: CALCULATED→REVIEW→APPROVED→DISBURSED→LOCKED', async () => {
            let currentStatus = 'CALCULATED';

            prisma.settlement.findUnique.mockImplementation(() => ({
                id: 'stl-1', status: currentStatus,
            }));
            prisma.settlement.update.mockImplementation(({ data }: any) => {
                currentStatus = data.status;
                return {
                    id: 'stl-1', status: currentStatus,
                    agreement: { partner: { id: 'p-1', company_name: 'Test' } },
                };
            });

            await service.submit('stl-1');
            expect(currentStatus).toBe('UNDER_REVIEW');

            await service.approve('stl-1', 'admin-1');
            expect(currentStatus).toBe('APPROVED');

            await service.disburse('stl-1');
            expect(currentStatus).toBe('DISBURSED');

            await service.lock('stl-1');
            expect(currentStatus).toBe('LOCKED');
        });
    });

    describe('getStatement', () => {
        it('should generate statement with financial summary', async () => {
            prisma.settlement.findUnique.mockResolvedValue({
                id: 'stl-1',
                status: 'APPROVED',
                period_start: new Date('2026-03-01'),
                period_end: new Date('2026-03-31'),
                gross_revenue: new Decimal(50000),
                total_deductions: new Decimal(5000),
                net_revenue: new Decimal(45000),
                partner_share: new Decimal(13500),
                operator_share: new Decimal(31500),
                agreement: {
                    partner: { id: 'p-1', company_name: 'Del Rosario' },
                    barangay: { id: 'brgy-1', name: 'Poblacion' },
                    revenue_share_rules: [],
                },
                lines: [{ description: 'Collections', category: 'PAYMENT', quantity: 10, unit_amount: new Decimal(5000), total_amount: new Decimal(50000) }],
                adjustments: [],
                statement: null,
            });
            prisma.partnerStatement.count.mockResolvedValue(0);
            prisma.partnerStatement.create.mockImplementation(({ data }: any) => {
                expect(data.data.financials.gross_revenue).toBe('50000.00');
                expect(data.data.financials.partner_share).toBe('13500.00');
                expect(data.statement_number).toBe('STMT-000001');
                return { id: 'stmt-1', ...data };
            });

            await service.getStatement('stl-1');
            expect(prisma.partnerStatement.create).toHaveBeenCalled();
        });
    });
});
