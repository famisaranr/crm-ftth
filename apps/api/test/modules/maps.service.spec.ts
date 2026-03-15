import { Test, TestingModule } from '@nestjs/testing';
import { MapsService } from '../../src/modules/maps/maps.service';
import { PrismaService } from '../../src/database/prisma.service';
import { createMockPrismaService } from '../helpers/mock-prisma';
import { Decimal } from '@prisma/client/runtime/library';

describe('MapsService', () => {
    let service: MapsService;
    let prisma: ReturnType<typeof createMockPrismaService>;

    beforeEach(async () => {
        prisma = createMockPrismaService();
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                MapsService,
                { provide: PrismaService, useValue: prisma },
            ],
        }).compile();
        service = module.get<MapsService>(MapsService);
    });

    describe('getTopology', () => {
        it('should return GeoJSON feature collection with nodes and links', async () => {
            prisma.networkAsset.findMany.mockResolvedValue([
                {
                    id: 'asset-1', name: 'OLT-Poblacion-01', status: 'ACTIVE',
                    latitude: new Decimal(14.5995), longitude: new Decimal(120.9842),
                    serial_number: 'SN-001', parent_asset_id: null,
                    asset_type: { id: 'type-1', name: 'OLT' },
                    barangay: { id: 'brgy-1', name: 'Poblacion' },
                },
            ]);
            prisma.fiberSegment.findMany.mockResolvedValue([
                { id: 'seg-1', from_asset_id: 'asset-1', to_asset_id: 'asset-2', length_meters: new Decimal(500), fiber_type: 'SM' },
            ]);

            const result = await service.getTopology();

            expect(result.type).toBe('FeatureCollection');
            expect(result.nodes).toHaveLength(1);
            expect(result.nodes[0].geometry.coordinates).toEqual([120.9842, 14.5995]);
            expect(result.links).toHaveLength(1);
            expect(result.summary.total_nodes).toBe(1);
        });

        it('should filter by barangay', async () => {
            prisma.networkAsset.findMany.mockResolvedValue([]);
            prisma.fiberSegment.findMany.mockResolvedValue([]);

            await service.getTopology('brgy-1');

            expect(prisma.networkAsset.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({ barangay_id: 'brgy-1' }),
                }),
            );
        });
    });

    describe('getCoverage', () => {
        it('should return barangay coverage with subscriber/asset counts', async () => {
            prisma.barangay.findMany.mockResolvedValue([
                {
                    id: 'brgy-1', name: 'Poblacion', status: 'ACTIVE',
                    latitude: new Decimal(14.5995), longitude: new Decimal(120.9842),
                    _count: { subscribers: 45, network_assets: 12 },
                },
            ]);

            const result = await service.getCoverage();

            expect(result.coverage).toHaveLength(1);
            expect(result.coverage[0].subscribers).toBe(45);
            expect(result.coverage[0].assets).toBe(12);
        });
    });
});
