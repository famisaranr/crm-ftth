import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateAgreementDto, UpdateAgreementStatusDto } from './dto/agreement.dto';
import { buildPaginationMeta } from '../../common/interfaces/paginated-response';

@Injectable()
export class AgreementsService {
    constructor(private readonly prisma: PrismaService) { }

    async create(createAgreementDto: CreateAgreementDto, userId: string) {
        const existing = await this.prisma.partnerAgreement.findUnique({
            where: { agreement_number: createAgreementDto.agreement_number }
        });
        if (existing) throw new ConflictException('Agreement number already exists');

        return this.prisma.$transaction(async (tx) => {
            const agreement = await tx.partnerAgreement.create({
                data: {
                    partner_id: createAgreementDto.partner_id,
                    barangay_id: createAgreementDto.barangay_id,
                    agreement_number: createAgreementDto.agreement_number,
                    effective_date: createAgreementDto.effective_date,
                    end_date: createAgreementDto.end_date,
                    status: createAgreementDto.status,
                    notes: createAgreementDto.notes,
                    created_by: userId
                }
            });

            await tx.revenueShareRule.createMany({
                data: createAgreementDto.revenue_share_rules.map(rule => ({
                    agreement_id: agreement.id,
                    share_type: rule.share_type,
                    partner_percentage: rule.partner_percentage,
                    deduction_buckets: rule.deduction_buckets || null,
                    description: rule.description
                }))
            });

            return this.findOne(agreement.id, tx);
        });
    }

    async findAll(page = 1, limit = 20) {
        const take = Math.min(limit, 100);
        const skip = (page - 1) * take;
        const [total, data] = await Promise.all([
            this.prisma.partnerAgreement.count(),
            this.prisma.partnerAgreement.findMany({
                include: {
                    partner: true,
                    barangay: true,
                    revenue_share_rules: true
                },
                orderBy: { created_at: 'desc' },
                skip,
                take,
            }),
        ]);
        return { data, meta: buildPaginationMeta(total, page, take) };
    }

    async findOne(id: string, tx: any = this.prisma) {
        const agreement = await tx.partnerAgreement.findUnique({
            where: { id },
            include: {
                partner: true,
                barangay: true,
                revenue_share_rules: true
            }
        });
        if (!agreement) throw new NotFoundException('Agreement not found');
        return agreement;
    }

    async updateStatus(id: string, updateStatusDto: UpdateAgreementStatusDto, userId: string) {
        await this.findOne(id);
        return this.prisma.partnerAgreement.update({
            where: { id },
            data: { status: updateStatusDto.status, updated_by: userId }
        });
    }
}
