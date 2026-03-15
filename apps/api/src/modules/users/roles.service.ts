import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { z } from 'zod';

export const createRoleSchema = z.object({
    name: z.string().min(2),
    description: z.string().optional(),
    permissions: z.array(z.string().uuid()).optional()
});
export type CreateRoleDto = z.infer<typeof createRoleSchema>;

@Injectable()
export class RolesService {
    constructor(private readonly prisma: PrismaService) { }

    async create(createRoleDto: CreateRoleDto) {
        return this.prisma.$transaction(async (tx) => {
            const role = await tx.role.create({
                data: {
                    name: createRoleDto.name,
                    description: createRoleDto.description
                }
            });

            if (createRoleDto.permissions?.length) {
                await tx.rolePermission.createMany({
                    data: createRoleDto.permissions.map(pid => ({
                        role_id: role.id,
                        permission_id: pid
                    }))
                });
            }

            return role;
        });
    }

    async findAll() {
        return this.prisma.role.findMany({
            include: { role_permissions: { include: { permission: true } } }
        });
    }

    async findOne(id: string) {
        const role = await this.prisma.role.findUnique({
            where: { id },
            include: { role_permissions: { include: { permission: true } } }
        });
        if (!role) throw new NotFoundException('Role not found');
        return role;
    }
}
