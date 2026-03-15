import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateBarangayDto, UpdateBarangayDto } from './dto/barangay.dto';
import { buildPaginationMeta } from '../../common/interfaces/paginated-response';

@Injectable()
export class BarangaysService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createBarangayDto: CreateBarangayDto, userId: string) {
    const existing = await this.prisma.barangay.findUnique({
      where: { name: createBarangayDto.name },
    });
    if (existing) throw new ConflictException('Barangay with this name already exists');

    return this.prisma.barangay.create({
      data: { ...createBarangayDto, created_by: userId },
    });
  }

  async findAll(page = 1, limit = 20) {
    const take = Math.min(limit, 100);
    const skip = (page - 1) * take;
    const [total, data] = await Promise.all([
      this.prisma.barangay.count(),
      this.prisma.barangay.findMany({
        include: { service_zones: true },
        orderBy: { name: 'asc' },
        skip,
        take,
      }),
    ]);
    return { data, meta: buildPaginationMeta(total, page, take) };
  }

  async findOne(id: string) {
    const barangay = await this.prisma.barangay.findUnique({
      where: { id },
      include: { service_zones: true, partner_agreements: { include: { partner: true } } },
    });
    if (!barangay) throw new NotFoundException('Barangay not found');
    return barangay;
  }

  async update(id: string, updateBarangayDto: UpdateBarangayDto, userId: string) {
    await this.findOne(id);
    return this.prisma.barangay.update({
      where: { id },
      data: { ...updateBarangayDto, updated_by: userId },
    });
  }

  async getZones(barangayId: string) {
    await this.findOne(barangayId);
    return this.prisma.serviceZone.findMany({
      where: { barangay_id: barangayId },
      orderBy: { name: 'asc' },
    });
  }

  async createZone(barangayId: string, data: { name: string; description?: string }) {
    await this.findOne(barangayId);
    return this.prisma.serviceZone.create({
      data: { barangay_id: barangayId, name: data.name, description: data.description },
    });
  }
}
