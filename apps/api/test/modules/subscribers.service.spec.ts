import { Test, TestingModule } from '@nestjs/testing';
import { SubscribersService } from '../../src/modules/subscribers/subscribers.service';
import { PrismaService } from '../../src/database/prisma.service';
import { createMockPrismaService } from '../helpers/mock-prisma';

describe('SubscribersService', () => {
    let service: SubscribersService;
    let prisma: ReturnType<typeof createMockPrismaService>;

    beforeEach(async () => {
        prisma = createMockPrismaService();
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                SubscribersService,
                { provide: PrismaService, useValue: prisma },
            ],
        }).compile();
        service = module.get<SubscribersService>(SubscribersService);
    });

    describe('findAll', () => {
        it('should return paginated subscribers', async () => {
            (prisma.subscriber as any).count.mockResolvedValue(50);
            (prisma.subscriber as any).findMany.mockResolvedValue([
                { id: 'sub-1', full_name: 'Juan Cruz', status: 'ACTIVE', account_number: 'ACC-001' },
            ]);

            const result = await service.findAll(1, 20);

            expect(result.data).toHaveLength(1);
            expect(result.meta.total).toBe(50);
        });

        it('should filter by status', async () => {
            (prisma.subscriber as any).count.mockResolvedValue(10);
            (prisma.subscriber as any).findMany.mockResolvedValue([]);

            await service.findAll(1, 20, undefined, 'ACTIVE');

            expect((prisma.subscriber as any).findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({ status: 'ACTIVE' }),
                }),
            );
        });
    });

    describe('create', () => {
        it('should generate account number and create subscriber', async () => {
            (prisma.barangay as any).findUnique.mockResolvedValue({ id: 'brgy-1', name: 'Poblacion' });
            (prisma.subscriber as any).count.mockResolvedValue(42);
            (prisma.subscriber as any).create.mockImplementation(({ data }: any) => {
                expect(data.account_number).toBe('POBL-00043');
                return { id: 'sub-1', ...data };
            });

            await service.create({
                full_name: 'Maria Santos',
                barangay_id: 'brgy-1',
                address: undefined as any,
                phone: '09171234567',
            });

            expect((prisma.subscriber as any).create).toHaveBeenCalled();
        });
    });
});
