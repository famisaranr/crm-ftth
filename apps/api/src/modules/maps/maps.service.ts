import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class MapsService {
    constructor(private readonly prisma: PrismaService) {}

    async getTopology(barangayId?: string) {
        const where: Record<string, unknown> = { status: { not: 'DECOMMISSIONED' } };
        if (barangayId) where.barangay_id = barangayId;

        const assets = await this.prisma.networkAsset.findMany({
            where: where as any,
            include: {
                asset_type: { select: { id: true, name: true } },
                barangay: { select: { id: true, name: true } },
            },
            orderBy: { created_at: 'asc' },
        });

        const segments = await this.prisma.fiberSegment.findMany({
            where: barangayId ? {
                OR: [
                    { from_asset: { barangay_id: barangayId } },
                    { to_asset: { barangay_id: barangayId } },
                ],
            } as any : undefined,
            select: {
                id: true,
                from_asset_id: true,
                to_asset_id: true,
                length_meters: true,
                fiber_type: true,
            },
        });

        // Convert to GeoJSON-like format
        const features = assets.map((asset) => ({
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: asset.latitude && asset.longitude
                    ? [Number(asset.longitude), Number(asset.latitude)]
                    : null,
            },
            properties: {
                id: asset.id,
                name: asset.name,
                asset_type: asset.asset_type.name,
                status: asset.status,
                barangay: asset.barangay.name,
                parent_asset_id: asset.parent_asset_id,
                serial_number: asset.serial_number,
            },
        }));

        const links = segments.map((seg) => ({
            type: 'Feature',
            geometry: { type: 'LineString', coordinates: [] },
            properties: {
                id: seg.id,
                from: seg.from_asset_id,
                to: seg.to_asset_id,
                length_meters: seg.length_meters ? Number(seg.length_meters) : null,
                fiber_type: seg.fiber_type,
            },
        }));

        return {
            type: 'FeatureCollection',
            nodes: features,
            links,
            summary: {
                total_nodes: features.length,
                total_links: links.length,
            },
        };
    }

    async getCoverage() {
        // Coverage data: subscriber count by barangay with coordinates
        const barangays = await this.prisma.barangay.findMany({
            select: {
                id: true,
                name: true,
                latitude: true,
                longitude: true,
                status: true,
                _count: {
                    select: {
                        subscribers: true,
                        network_assets: true,
                    },
                },
            },
        });

        return {
            coverage: barangays.map((b) => ({
                barangay_id: b.id,
                name: b.name,
                latitude: b.latitude ? Number(b.latitude) : null,
                longitude: b.longitude ? Number(b.longitude) : null,
                subscribers: b._count.subscribers,
                assets: b._count.network_assets,
                status: b.status,
            })),
        };
    }
}
