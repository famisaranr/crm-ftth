import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import {
    AssignTechnicianDto,
    UpdateInstallationStatusDto,
    ActivateConnectionDto,
    UploadPhotoDto,
} from './dto/installation.dto';
import { buildPaginationMeta } from '../../common/interfaces/paginated-response';

// Valid status transitions
const VALID_TRANSITIONS: Record<string, string[]> = {
    LEAD_CREATED: ['SURVEY_SCHEDULED', 'CANCELLED'],
    SURVEY_SCHEDULED: ['SURVEY_COMPLETED', 'RESCHEDULED', 'CANCELLED'],
    SURVEY_COMPLETED: ['FEASIBLE', 'NOT_FEASIBLE'],
    FEASIBLE: ['INSTALL_SCHEDULED'],
    NOT_FEASIBLE: ['CANCELLED'],
    INSTALL_SCHEDULED: ['INSTALLED', 'RESCHEDULED', 'FAILED', 'CANCELLED'],
    INSTALLED: ['ACTIVATED', 'FAILED'],
    ACTIVATED: ['QA_VERIFIED'],
    QA_VERIFIED: ['BILLING_STARTED'],
    RESCHEDULED: ['SURVEY_SCHEDULED', 'INSTALL_SCHEDULED', 'CANCELLED'],
    FAILED: ['RESCHEDULED', 'CANCELLED'],
};

@Injectable()
export class InstallationsService {
    constructor(private readonly prisma: PrismaService) {}

    async findAll(page = 1, limit = 20, status?: string, technicianId?: string) {
        const take = Math.min(limit, 100);
        const skip = (page - 1) * take;

        const where: Record<string, unknown> = {};
        if (status) where.status = status;
        if (technicianId) where.assigned_technician_id = technicianId;

        const [total, data] = await Promise.all([
            this.prisma.installationJob.count({ where: where as any }),
            this.prisma.installationJob.findMany({
                where: where as any,
                include: {
                    subscriber: { select: { id: true, account_number: true, full_name: true } },
                    technician: { select: { id: true, full_name: true } },
                },
                orderBy: { created_at: 'desc' },
                skip,
                take,
            }),
        ]);
        return { data, meta: buildPaginationMeta(total, page, take) };
    }

    async findOne(id: string) {
        const job = await this.prisma.installationJob.findUnique({
            where: { id },
            include: {
                subscriber: { include: { address: true, barangay: true } },
                technician: { select: { id: true, full_name: true, phone: true } },
                materials: true,
                photos: true,
            },
        });
        if (!job) throw new NotFoundException('Installation job not found');
        return job;
    }

    async assignTechnician(id: string, dto: AssignTechnicianDto) {
        const job = await this.prisma.installationJob.findUnique({ where: { id } });
        if (!job) throw new NotFoundException('Installation job not found');

        return this.prisma.installationJob.update({
            where: { id },
            data: {
                assigned_technician_id: dto.technician_id,
                scheduled_date: dto.scheduled_date ? new Date(dto.scheduled_date) : undefined,
                notes: dto.notes || job.notes,
            },
            include: {
                subscriber: { select: { id: true, account_number: true, full_name: true } },
                technician: { select: { id: true, full_name: true } },
            },
        });
    }

    async updateStatus(id: string, dto: UpdateInstallationStatusDto) {
        const job = await this.prisma.installationJob.findUnique({ where: { id } });
        if (!job) throw new NotFoundException('Installation job not found');

        // Validate transition
        const allowed = VALID_TRANSITIONS[job.status] || [];
        if (!allowed.includes(dto.status)) {
            throw new BadRequestException(
                `Invalid status transition: ${job.status} → ${dto.status}. Allowed: ${allowed.join(', ')}`,
            );
        }

        const updateData: Record<string, unknown> = { status: dto.status };
        if (dto.failure_reason) updateData.failure_reason = dto.failure_reason;
        if (dto.reschedule_reason) updateData.reschedule_reason = dto.reschedule_reason;
        if (dto.notes) updateData.notes = dto.notes;
        if (dto.status === 'INSTALLED') updateData.completed_date = new Date();

        return this.prisma.installationJob.update({
            where: { id },
            data: updateData,
            include: {
                subscriber: { select: { id: true, account_number: true, full_name: true } },
                technician: { select: { id: true, full_name: true } },
            },
        });
    }

    async activate(id: string, dto: ActivateConnectionDto) {
        const job = await this.prisma.installationJob.findUnique({ where: { id } });
        if (!job) throw new NotFoundException('Installation job not found');

        if (job.status !== 'INSTALLED') {
            throw new BadRequestException('Job must be in INSTALLED status to activate');
        }

        return this.prisma.installationJob.update({
            where: { id },
            data: {
                status: 'ACTIVATED',
                activation_date: dto.activation_date ? new Date(dto.activation_date) : new Date(),
                notes: dto.notes || job.notes,
            },
            include: {
                subscriber: { select: { id: true, account_number: true, full_name: true } },
                technician: { select: { id: true, full_name: true } },
            },
        });
    }

    async uploadPhoto(id: string, dto: UploadPhotoDto, uploadedBy?: string) {
        const job = await this.prisma.installationJob.findUnique({ where: { id } });
        if (!job) throw new NotFoundException('Installation job not found');

        return this.prisma.installationPhoto.create({
            data: {
                installation_id: id,
                file_url: dto.file_url,
                caption: dto.caption,
                phase: dto.phase,
                uploaded_by: uploadedBy,
            },
        });
    }
}
