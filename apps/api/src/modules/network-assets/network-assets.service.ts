import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateNetworkAssetDto, UpdateNetworkAssetDto } from './dto/network-asset.dto';
import { buildPaginationMeta } from '../../common/interfaces/paginated-response';

@Injectable()
export class NetworkAssetsService {
    constructor(private readonly prisma: PrismaService) {}

    async create(dto: CreateNetworkAssetDto) {
        const { olt_port, splitter, distribution_box, ont_device, ...assetData } = dto;

        return this.prisma.networkAsset.create({
            data: {
                ...assetData,
                olt_port: olt_port ? { create: olt_port } : undefined,
                splitter: splitter ? { create: splitter } : undefined,
                distribution_box: distribution_box ? { create: distribution_box } : undefined,
                ont_device: ont_device ? { create: ont_device } : undefined,
            },
            include: {
                asset_type: true,
                barangay: true,
                olt_port: true,
                splitter: true,
                distribution_box: true,
                ont_device: true,
            },
        });
    }

    async findAll(page = 1, limit = 20, barangayId?: string, assetTypeId?: string, status?: string) {
        const take = Math.min(limit, 100);
        const skip = (page - 1) * take;

        const where: Record<string, unknown> = {};
        if (barangayId) where.barangay_id = barangayId;
        if (assetTypeId) where.asset_type_id = assetTypeId;
        if (status) where.status = status;

        const [total, data] = await Promise.all([
            this.prisma.networkAsset.count({ where: where as any }),
            this.prisma.networkAsset.findMany({
                where: where as any,
                include: {
                    asset_type: true,
                    barangay: true,
                    olt_port: true,
                    splitter: true,
                    distribution_box: true,
                    ont_device: true,
                },
                orderBy: { created_at: 'desc' },
                skip,
                take,
            }),
        ]);
        return { data, meta: buildPaginationMeta(total, page, take) };
    }

    async findOne(id: string) {
        const asset = await this.prisma.networkAsset.findUnique({
            where: { id },
            include: {
                asset_type: true,
                barangay: true,
                parent_asset: { include: { asset_type: true } },
                child_assets: { include: { asset_type: true, olt_port: true, splitter: true, distribution_box: true, ont_device: true } },
                olt_port: true,
                splitter: true,
                distribution_box: true,
                ont_device: { include: { subscriber: true } },
            },
        });
        if (!asset) throw new NotFoundException('Network asset not found');
        return asset;
    }

    async update(id: string, dto: UpdateNetworkAssetDto) {
        const existing = await this.prisma.networkAsset.findUnique({ where: { id } });
        if (!existing) throw new NotFoundException('Network asset not found');

        return this.prisma.networkAsset.update({
            where: { id },
            data: dto,
            include: { asset_type: true, barangay: true },
        });
    }

    async softDelete(id: string) {
        const existing = await this.prisma.networkAsset.findUnique({ where: { id } });
        if (!existing) throw new NotFoundException('Network asset not found');

        return this.prisma.networkAsset.update({
            where: { id },
            data: { status: 'DECOMMISSIONED' },
        });
    }

    async getTopology(barangayId?: string) {
        const where: Record<string, unknown> = { parent_asset_id: null };
        if (barangayId) where.barangay_id = barangayId;

        const roots = await this.prisma.networkAsset.findMany({
            where: where as any,
            include: {
                asset_type: true,
                barangay: true,
                olt_port: true,
                child_assets: {
                    include: {
                        asset_type: true,
                        splitter: true,
                        child_assets: {
                            include: {
                                asset_type: true,
                                distribution_box: true,
                                child_assets: {
                                    include: {
                                        asset_type: true,
                                        ont_device: { include: { subscriber: true } },
                                    },
                                },
                            },
                        },
                    },
                },
            },
            orderBy: { name: 'asc' },
        });

        return roots;
    }
}
