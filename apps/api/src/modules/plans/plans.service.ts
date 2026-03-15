import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreatePlanDto, UpdatePlanDto, type CreatePromoDto } from './dto/plan.dto';
import { buildPaginationMeta } from '../../common/interfaces/paginated-response';

@Injectable()
export class PlansService {
    constructor(private readonly prisma: PrismaService) { }

    async create(createPlanDto: CreatePlanDto, userId: string) {
        const { plan_features, promos, ...planData } = createPlanDto;

        return this.prisma.$transaction(async (tx) => {
            const plan = await tx.servicePlan.create({
                data: {
                    ...planData,
                    created_by: userId
                }
            });

            if (plan_features?.length) {
                await tx.planFeature.createMany({
                    data: plan_features.map(f => ({
                        plan_id: plan.id,
                        feature_name: f.feature_name,
                        feature_value: f.feature_value
                    }))
                });
            }

            if (promos?.length) {
                await tx.promo.createMany({
                    data: promos.map(p => ({
                        plan_id: plan.id,
                        ...p
                    }))
                });
            }

            return this.findOne(plan.id, tx);
        });
    }

    async findAll(page = 1, limit = 20) {
        const take = Math.min(limit, 100);
        const skip = (page - 1) * take;
        const [total, data] = await Promise.all([
            this.prisma.servicePlan.count(),
            this.prisma.servicePlan.findMany({
                include: {
                    plan_features: true,
                    promos: true
                },
                orderBy: { speed_mbps: 'asc' },
                skip,
                take,
            }),
        ]);
        return { data, meta: buildPaginationMeta(total, page, take) };
    }

    async findOne(id: string, tx: any = this.prisma) {
        const plan = await tx.servicePlan.findUnique({
            where: { id },
            include: {
                plan_features: true,
                promos: true
            }
        });
        if (!plan) throw new NotFoundException('Service plan not found');
        return plan;
    }

    async update(id: string, updatePlanDto: UpdatePlanDto, userId: string) {
        await this.findOne(id); // verify
        const { plan_features, promos, ...planData } = updatePlanDto;

        // Simple update for core plan details for now. 
        // Features and Promos would need complex diffing, so we omit from this simple update.
        return this.prisma.servicePlan.update({
            where: { id },
            data: {
                ...planData,
                updated_by: userId
            }
        });
    }

    async getPromos(planId: string) {
        await this.findOne(planId); // verify plan exists
        return this.prisma.promo.findMany({
            where: { plan_id: planId },
            orderBy: { created_at: 'desc' },
        });
    }

    async createPromo(planId: string, dto: CreatePromoDto) {
        await this.findOne(planId); // verify plan exists
        return this.prisma.promo.create({
            data: {
                plan_id: planId,
                name: dto.name,
                discount_amount: dto.discount_amount,
                discount_percentage: dto.discount_percentage,
                duration_months: dto.duration_months,
                valid_from: dto.valid_from,
                valid_to: dto.valid_to,
                status: dto.status,
            },
        });
    }
}
