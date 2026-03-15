import { Test, TestingModule } from '@nestjs/testing';
import { BillingService } from '../../src/modules/billing/billing.service';
import { PrismaService } from '../../src/database/prisma.service';
import { createMockPrismaService } from '../helpers/mock-prisma';
import { Decimal } from '@prisma/client/runtime/library';

describe('BillingService', () => {
    let service: BillingService;
    let prisma: ReturnType<typeof createMockPrismaService>;

    beforeEach(async () => {
        prisma = createMockPrismaService();
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                BillingService,
                { provide: PrismaService, useValue: prisma },
            ],
        }).compile();
        service = module.get<BillingService>(BillingService);
    });

    describe('listCycles', () => {
        it('should return paginated billing cycles', async () => {
            (prisma.billingCycle as any).count.mockResolvedValue(1);
            (prisma.billingCycle as any).findMany.mockResolvedValue([
                { id: '1', period_start: new Date(), period_end: new Date(), status: 'COMPLETED' },
            ]);

            const result = await service.listCycles(1, 20);

            expect(result.data).toHaveLength(1);
            expect(result.meta.total).toBe(1);
        });
    });

    describe('generateInvoices', () => {
        it('should create invoices for active subscribers', async () => {
            (prisma.billingCycle as any).findUnique.mockResolvedValue({
                id: 'cycle-1',
                barangay_id: 'brgy-1',
                period_start: new Date('2026-03-01'),
                period_end: new Date('2026-03-31'),
                status: 'PENDING',
            });
            (prisma.billingCycle as any).update.mockResolvedValue({});
            (prisma.subscriber as any).findMany.mockResolvedValue([{
                id: 'sub-1',
                subscriptions: [{
                    plan: { name: 'Fiber 50', monthly_fee: new Decimal(1500) },
                    status: 'ACTIVE',
                }],
            }]);
            (prisma.invoice as any).count.mockResolvedValue(0);
            (prisma.invoice as any).create.mockResolvedValue({
                id: 'inv-1', invoice_number: 'INV-000001',
            });
            (prisma.accountLedgerEntry as any).findFirst.mockResolvedValue(null);
            (prisma.accountLedgerEntry as any).create.mockResolvedValue({});

            const result = await service.generateInvoices('cycle-1', {});

            expect(result.invoices_generated).toBe(1);
            expect((prisma.invoice as any).create).toHaveBeenCalled();
            expect((prisma.accountLedgerEntry as any).create).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({ entry_type: 'CHARGE' }),
                }),
            );
        });
    });

    describe('voidInvoice', () => {
        it('should void a generated invoice and create reversal entries', async () => {
            (prisma.invoice as any).findUnique.mockResolvedValue({
                id: 'inv-1', status: 'GENERATED',
                total_amount: new Decimal(1500),
                subscriber_id: 'sub-1',
            });
            (prisma.invoice as any).update.mockResolvedValue({ id: 'inv-1', status: 'VOIDED' });
            (prisma.accountLedgerEntry as any).findFirst.mockResolvedValue(null);
            (prisma.accountLedgerEntry as any).create.mockResolvedValue({});

            await service.voidInvoice('inv-1', { reason: 'Duplicate' });

            expect((prisma.invoice as any).update).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({ status: 'VOIDED' }),
                }),
            );
            expect((prisma.accountLedgerEntry as any).create).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({ entry_type: 'REVERSAL' }),
                }),
            );
        });

        it('should reject voiding a paid invoice', async () => {
            (prisma.invoice as any).findUnique.mockResolvedValue({
                id: 'inv-1', status: 'PAID',
            });

            await expect(
                service.voidInvoice('inv-1', { reason: 'Test' }),
            ).rejects.toThrow('Cannot void a paid invoice');
        });
    });

    describe('adjustInvoice', () => {
        it('should create credit adjustment and ADJUSTMENT_CREDIT ledger entry', async () => {
            (prisma.invoice as any).findUnique.mockResolvedValue({
                id: 'inv-1', status: 'GENERATED',
                total_amount: new Decimal(1500),
                subscriber_id: 'sub-1',
            });
            (prisma.adjustment as any).create.mockResolvedValue({
                id: 'adj-1', type: 'CREDIT', amount: new Decimal(200),
            });
            (prisma.invoice as any).update.mockResolvedValue({
                id: 'inv-1', total_amount: new Decimal(1300),
            });
            (prisma.accountLedgerEntry as any).findFirst.mockResolvedValue(null);
            (prisma.accountLedgerEntry as any).create.mockResolvedValue({});

            await service.adjustInvoice('inv-1', {
                type: 'CREDIT',
                amount: 200,
                reason: 'Goodwill discount',
            });

            expect((prisma.adjustment as any).create).toHaveBeenCalled();
            expect((prisma.accountLedgerEntry as any).create).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({ entry_type: 'ADJUSTMENT_CREDIT' }),
                }),
            );
        });
    });

    describe('createCycle', () => {
        it('should create a new billing cycle', async () => {
            (prisma.billingCycle as any).findFirst.mockResolvedValue(null);
            (prisma.billingCycle as any).create.mockResolvedValue({
                id: 'cycle-1',
                barangay_id: 'brgy-1',
                period_start: new Date('2026-04-01'),
                period_end: new Date('2026-04-30'),
                status: 'PENDING',
            });

            const result = await service.createCycle({
                barangay_id: 'brgy-1',
                period_start: '2026-04-01',
                period_end: '2026-04-30',
            });

            expect(result.status).toBe('PENDING');
            expect((prisma.billingCycle as any).create).toHaveBeenCalled();
        });

        it('should reject duplicate cycle', async () => {
            (prisma.billingCycle as any).findFirst.mockResolvedValue({ id: 'existing' });

            await expect(
                service.createCycle({
                    barangay_id: 'brgy-1',
                    period_start: '2026-04-01',
                    period_end: '2026-04-30',
                }),
            ).rejects.toThrow('Billing cycle already exists');
        });
    });

    describe('generateInvoices with proration', () => {
        it('should prorate mid-cycle activations', async () => {
            const cycleStart = new Date('2026-04-01');
            const cycleEnd = new Date('2026-04-30');

            (prisma.billingCycle as any).findUnique.mockResolvedValue({
                id: 'cycle-1',
                barangay_id: 'brgy-1',
                period_start: cycleStart,
                period_end: cycleEnd,
                status: 'PENDING',
            });
            (prisma.billingCycle as any).update.mockResolvedValue({});
            (prisma.subscriber as any).findMany.mockResolvedValue([{
                id: 'sub-1',
                subscriptions: [{
                    start_date: new Date('2026-04-15'), // Mid-cycle
                    status: 'ACTIVE',
                    plan: {
                        name: 'Fiber 50',
                        monthly_fee: new Decimal(1500),
                        promos: [],
                    },
                }],
            }]);
            (prisma.invoice as any).count.mockResolvedValue(0);
            (prisma.invoice as any).create.mockResolvedValue({
                id: 'inv-1', invoice_number: 'INV-000001',
            });
            (prisma.accountLedgerEntry as any).findFirst.mockResolvedValue(null);
            (prisma.accountLedgerEntry as any).create.mockResolvedValue({});

            const result = await service.generateInvoices('cycle-1', {});

            expect(result.invoices_generated).toBe(1);
            // Verify invoice was created with PRORATE_CHARGE line type
            const createCall = (prisma.invoice as any).create.mock.calls[0][0];
            expect(createCall.data.lines.create[0].line_type).toBe('PRORATE_CHARGE');
            expect(createCall.data.lines.create[0].description).toContain('Prorated');
        });
    });

    describe('generateInvoices with promo discounts', () => {
        it('should apply promo percentage discount', async () => {
            (prisma.billingCycle as any).findUnique.mockResolvedValue({
                id: 'cycle-1',
                barangay_id: 'brgy-1',
                period_start: new Date('2026-04-01'),
                period_end: new Date('2026-04-30'),
                status: 'PENDING',
            });
            (prisma.billingCycle as any).update.mockResolvedValue({});
            (prisma.subscriber as any).findMany.mockResolvedValue([{
                id: 'sub-1',
                subscriptions: [{
                    start_date: new Date('2026-01-01'), // Full month
                    status: 'ACTIVE',
                    plan: {
                        name: 'Fiber 50',
                        monthly_fee: new Decimal(1500),
                        promos: [{
                            name: 'Summer Special',
                            discount_percentage: new Decimal(20),
                            discount_amount: null,
                            valid_from: new Date('2026-04-01'),
                            valid_to: new Date('2026-06-30'),
                            status: 'ACTIVE',
                        }],
                    },
                }],
            }]);
            (prisma.invoice as any).count.mockResolvedValue(0);
            (prisma.invoice as any).create.mockResolvedValue({
                id: 'inv-1', invoice_number: 'INV-000001',
            });
            (prisma.accountLedgerEntry as any).findFirst.mockResolvedValue(null);
            (prisma.accountLedgerEntry as any).create.mockResolvedValue({});

            const result = await service.generateInvoices('cycle-1', {});

            expect(result.invoices_generated).toBe(1);
            const createCall = (prisma.invoice as any).create.mock.calls[0][0];
            // Should have 2 lines: MONTHLY_CHARGE + PROMO_DISCOUNT
            expect(createCall.data.lines.create).toHaveLength(2);
            expect(createCall.data.lines.create[1].line_type).toBe('PROMO_DISCOUNT');
            // 1500 - 20% = 1200 total
            expect(createCall.data.total_amount.toNumber()).toBe(1200);
        });
    });

    describe('applyPenalties', () => {
        it('should apply penalties to overdue invoices', async () => {
            (prisma.systemSetting as any).findUnique.mockResolvedValue(null); // Use defaults
            const pastDue = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000); // 15 days ago

            (prisma.invoice as any).findMany.mockResolvedValue([{
                id: 'inv-1',
                invoice_number: 'INV-000001',
                subscriber_id: 'sub-1',
                total_amount: new Decimal(1500),
                due_date: pastDue,
                status: 'OVERDUE',
                lines: [], // No existing penalties
                subscriber: { id: 'sub-1', account_number: 'POB-00001' },
            }]);
            (prisma.invoiceLine as any).create.mockResolvedValue({});
            (prisma.invoice as any).update.mockResolvedValue({});
            (prisma.accountLedgerEntry as any).findFirst.mockResolvedValue(null);
            (prisma.accountLedgerEntry as any).create.mockResolvedValue({});

            const result = await service.applyPenalties({});

            expect(result.penalties_applied).toBe(1);
            expect((prisma.invoiceLine as any).create).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({ line_type: 'PENALTY' }),
                }),
            );
            expect((prisma.accountLedgerEntry as any).create).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({ entry_type: 'PENALTY' }),
                }),
            );
        });
    });

    describe('getAgingReport', () => {
        it('should categorize invoices into aging buckets', async () => {
            const now = new Date();
            (prisma.invoice as any).findMany.mockResolvedValue([
                {
                    id: 'inv-current', invoice_number: 'INV-001',
                    total_amount: new Decimal(1000), amount_paid: new Decimal(0),
                    due_date: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000), // 5 days future
                    status: 'GENERATED',
                    subscriber: { id: 's1', account_number: 'POB-00001', full_name: 'Juan' },
                },
                {
                    id: 'inv-30', invoice_number: 'INV-002',
                    total_amount: new Decimal(2000), amount_paid: new Decimal(500),
                    due_date: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000), // 20 days ago
                    status: 'OVERDUE',
                    subscriber: { id: 's2', account_number: 'POB-00002', full_name: 'Maria' },
                },
            ]);

            const result = await service.getAgingReport();

            expect(result.summary.current.count).toBe(1);
            expect(result.summary.days_30.count).toBe(1);
            expect(result.invoices).toHaveLength(2);
        });
    });
});
