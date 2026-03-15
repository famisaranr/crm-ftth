import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsService } from '../../src/modules/payments/payments.service';
import { PrismaService } from '../../src/database/prisma.service';
import { createMockPrismaService } from '../helpers/mock-prisma';
import { Decimal } from '@prisma/client/runtime/library';

describe('PaymentsService', () => {
    let service: PaymentsService;
    let prisma: ReturnType<typeof createMockPrismaService>;

    beforeEach(async () => {
        prisma = createMockPrismaService();
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PaymentsService,
                { provide: PrismaService, useValue: prisma },
            ],
        }).compile();
        service = module.get<PaymentsService>(PaymentsService);
    });

    describe('postPayment', () => {
        it('should create payment, update invoice, and create ledger entry', async () => {
            const mockInvoice = {
                id: 'inv-1',
                subscriber_id: 'sub-1',
                total_amount: new Decimal(1500),
                amount_paid: new Decimal(0),
                status: 'GENERATED',
            };

            (prisma.invoice as any).findUnique.mockResolvedValue(mockInvoice);
            (prisma.payment as any).create.mockResolvedValue({
                id: 'pmt-1',
                amount: new Decimal(1500),
                subscriber_id: 'sub-1',
            });
            (prisma.invoice as any).update.mockResolvedValue({
                ...mockInvoice,
                amount_paid: new Decimal(1500),
                status: 'PAID',
            });
            (prisma.accountLedgerEntry as any).create.mockResolvedValue({});

            const result = await service.postPayment(
                {
                    invoice_id: 'inv-1',
                    subscriber_id: 'sub-1',
                    barangay_id: 'brgy-1',
                    amount: 1500,
                    method: 'CASH',
                },
                'user-1',
            );

            expect((prisma.payment as any).create).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({ method: 'CASH' }),
                }),
            );
            expect((prisma.accountLedgerEntry as any).create).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({ entry_type: 'PAYMENT' }),
                }),
            );
        });
    });

    describe('reversePayment', () => {
        it('should create reversal ledger entry', async () => {
            const mockPayment = {
                id: 'pmt-1',
                subscriber_id: 'sub-1',
                amount: new Decimal(1500),
                reversed_at: null,
            };

            (prisma.payment as any).findUnique.mockResolvedValue(mockPayment);
            (prisma.payment as any).update.mockResolvedValue({
                ...mockPayment,
                reversed_at: new Date(),
            });
            (prisma.accountLedgerEntry as any).create.mockResolvedValue({});

            await service.reversePayment('pmt-1', { reason: 'Bounced check' }, 'user-1');

            expect((prisma.accountLedgerEntry as any).create).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({ entry_type: 'REVERSAL' }),
                }),
            );
        });

        it('should reject reversing already-reversed payment', async () => {
            (prisma.payment as any).findUnique.mockResolvedValue({
                id: 'pmt-1',
                reversed_at: new Date(),
            });

            await expect(
                service.reversePayment('pmt-1', { reason: 'Test' }, 'user-1'),
            ).rejects.toThrow();
        });
    });

    describe('listPayments', () => {
        it('should return paginated payments', async () => {
            (prisma.payment as any).count.mockResolvedValue(5);
            (prisma.payment as any).findMany.mockResolvedValue([
                { id: 'pmt-1', amount: new Decimal(1500) },
            ]);

            const result = await service.listPayments(1, 20);

            expect(result.meta.total).toBe(5);
            expect((prisma.payment as any).findMany).toHaveBeenCalled();
        });
    });
});
