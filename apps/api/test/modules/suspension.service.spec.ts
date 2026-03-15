import { Test, TestingModule } from '@nestjs/testing';
import { SuspensionService } from '../../src/modules/suspension/suspension.service';
import { PrismaService } from '../../src/database/prisma.service';
import { createMockPrismaService } from '../helpers/mock-prisma';
import { Decimal } from '@prisma/client/runtime/library';

describe('SuspensionService', () => {
    let service: SuspensionService;
    let prisma: ReturnType<typeof createMockPrismaService>;

    beforeEach(async () => {
        prisma = createMockPrismaService();
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                SuspensionService,
                { provide: PrismaService, useValue: prisma },
            ],
        }).compile();
        service = module.get<SuspensionService>(SuspensionService);
    });

    describe('getSuspensionQueue', () => {
        it('should return overdue subscribers based on configurable threshold', async () => {
            (prisma.systemSetting as any).findUnique.mockResolvedValue({
                key: 'billing.auto_suspend_days',
                value: '15',
            });

            (prisma.subscriber as any).count.mockResolvedValue(1);
            (prisma.subscriber as any).findMany.mockResolvedValue([]);

            const result = await service.getSuspensionQueue(1, 20);

            expect(result).toBeDefined();
            expect(result).toHaveProperty('meta');
            expect((prisma.systemSetting as any).findUnique).toHaveBeenCalledWith(
                expect.objectContaining({ where: { key: 'billing.auto_suspend_days' } }),
            );
        });
    });

    describe('override', () => {
        it('should create suspension action with FORCE_SUSPEND', async () => {
            (prisma.subscriber as any).findFirst.mockResolvedValue({
                id: 'sub-1', status: 'ACTIVE',
            });
            (prisma.subscriber as any).update.mockResolvedValue({
                id: 'sub-1', status: 'SUSPENDED_HARD',
            });
            (prisma.suspensionAction as any).create.mockResolvedValue({
                id: 'sa-1',
                subscriber_id: 'sub-1',
                action_type: 'SUSPENDED',
            });

            const result = await service.override('sub-1', {
                action: 'FORCE_SUSPEND',
                reason: 'Non-payment',
            }, 'user-1');

            expect((prisma.suspensionAction as any).create).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        action_type: 'SUSPENDED',
                        suspension_type: 'HARD',
                    }),
                }),
            );
        });

        it('should reactivate and set status to ACTIVE', async () => {
            (prisma.subscriber as any).findFirst.mockResolvedValue({
                id: 'sub-1', status: 'SUSPENDED_HARD', barangay_id: 'brgy-1',
            });
            (prisma.subscriber as any).update.mockResolvedValue({
                id: 'sub-1', status: 'ACTIVE',
            });
            (prisma.suspensionAction as any).create.mockResolvedValue({
                id: 'sa-2',
                action_type: 'REACTIVATED',
            });
            // Reactivation fee mocks (no fee configured)
            (prisma.systemSetting as any).findUnique.mockResolvedValue(null);

            await service.override('sub-1', {
                action: 'REACTIVATE',
                reason: 'Payment received',
            }, 'user-1');

            expect((prisma.subscriber as any).update).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({ status: 'ACTIVE' }),
                }),
            );
        });

        it('should charge reactivation fee when reactivating from SUSPENDED_HARD', async () => {
            (prisma.subscriber as any).findFirst.mockResolvedValue({
                id: 'sub-1', status: 'SUSPENDED_HARD', barangay_id: 'brgy-1',
            });
            (prisma.subscriber as any).update.mockResolvedValue({});
            (prisma.suspensionAction as any).create.mockResolvedValue({ id: 'sa-3' });
            (prisma.systemSetting as any).findUnique.mockResolvedValue({
                key: 'billing.reactivation_fee', value: '500',
            });
            (prisma.invoice as any).count.mockResolvedValue(5);
            (prisma.invoice as any).create.mockResolvedValue({
                id: 'inv-react', invoice_number: 'INV-000006',
            });
            (prisma.accountLedgerEntry as any).findFirst.mockResolvedValue(null);
            (prisma.accountLedgerEntry as any).create.mockResolvedValue({});

            await service.override('sub-1', {
                action: 'REACTIVATE',
                reason: 'Full payment received',
            }, 'user-1');

            // Should create reactivation fee invoice
            expect((prisma.invoice as any).create).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        subscriber_id: 'sub-1',
                        lines: expect.objectContaining({
                            create: expect.arrayContaining([
                                expect.objectContaining({ line_type: 'REACTIVATION_FEE' }),
                            ]),
                        }),
                    }),
                }),
            );
            // Should create REACTIVATION_FEE ledger entry
            expect((prisma.accountLedgerEntry as any).create).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({ entry_type: 'REACTIVATION_FEE' }),
                }),
            );
        });
    });

    describe('executeBulk', () => {
        it('should soft-suspend active subscribers past threshold', async () => {
            // Settings mocks
            (prisma.systemSetting as any).findUnique
                .mockResolvedValueOnce({ key: 'billing.auto_suspend_days', value: '30' })
                .mockResolvedValueOnce({ key: 'billing.hard_suspend_days', value: '60' });

            // No soft-suspended subscribers to escalate
            (prisma.subscriber as any).findMany
                .mockResolvedValueOnce([]) // SUSPENDED_SOFT query
                .mockResolvedValueOnce([   // ACTIVE query
                    {
                        id: 'sub-1',
                        status: 'ACTIVE',
                        invoices: [{
                            total_amount: new Decimal(1500),
                            amount_paid: new Decimal(0),
                            due_date: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000),
                        }],
                    },
                ]);
            (prisma.subscriber as any).update.mockResolvedValue({});
            (prisma.suspensionAction as any).create.mockResolvedValue({});

            const result = await service.executeBulk('user-1');

            expect(result.soft_suspended).toBe(1);
            expect(result.hard_escalated).toBe(0);
            expect((prisma.subscriber as any).update).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({ status: 'SUSPENDED_SOFT' }),
                }),
            );
        });

        it('should escalate soft-suspended subscribers to hard suspension', async () => {
            (prisma.systemSetting as any).findUnique
                .mockResolvedValueOnce({ key: 'billing.auto_suspend_days', value: '30' })
                .mockResolvedValueOnce({ key: 'billing.hard_suspend_days', value: '60' });

            (prisma.subscriber as any).findMany
                .mockResolvedValueOnce([   // SUSPENDED_SOFT query
                    {
                        id: 'sub-2',
                        status: 'SUSPENDED_SOFT',
                        invoices: [{
                            total_amount: new Decimal(3000),
                            amount_paid: new Decimal(0),
                            due_date: new Date(Date.now() - 65 * 24 * 60 * 60 * 1000),
                        }],
                    },
                ])
                .mockResolvedValueOnce([]); // ACTIVE query
            (prisma.subscriber as any).update.mockResolvedValue({});
            (prisma.suspensionAction as any).create.mockResolvedValue({});

            const result = await service.executeBulk('user-1');

            expect(result.hard_escalated).toBe(1);
            expect(result.soft_suspended).toBe(0);
            expect((prisma.subscriber as any).update).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({ status: 'SUSPENDED_HARD' }),
                }),
            );
        });
    });
});
