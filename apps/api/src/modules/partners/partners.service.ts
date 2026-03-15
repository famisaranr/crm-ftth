import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreatePartnerDto, UpdatePartnerDto } from './dto/partner.dto';
import { buildPaginationMeta } from '../../common/interfaces/paginated-response';

@Injectable()
export class PartnersService {
    constructor(private readonly prisma: PrismaService) { }

    async create(createPartnerDto: CreatePartnerDto, userId: string) {
        return this.prisma.partner.create({
            data: {
                ...createPartnerDto,
                created_by: userId
            }
        });
    }

    async findAll(page = 1, limit = 20) {
        const take = Math.min(limit, 100);
        const skip = (page - 1) * take;
        const [total, data] = await Promise.all([
            this.prisma.partner.count(),
            this.prisma.partner.findMany({
                orderBy: { company_name: 'asc' },
                skip,
                take,
            }),
        ]);
        return { data, meta: buildPaginationMeta(total, page, take) };
    }

    async findOne(id: string) {
        const partner = await this.prisma.partner.findUnique({
            where: { id },
            include: { partner_agreements: { include: { barangay: true } } }
        });
        if (!partner) throw new NotFoundException('Partner not found');
        return partner;
    }

    async update(id: string, updatePartnerDto: UpdatePartnerDto, userId: string) {
        await this.findOne(id);
        return this.prisma.partner.update({
            where: { id },
            data: {
                ...updatePartnerDto,
                updated_by: userId
            }
        });
    }
}
