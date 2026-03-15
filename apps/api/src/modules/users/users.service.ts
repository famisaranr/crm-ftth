import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateUserDto, UpdateUserDto, AssignRolesDto, AssignScopesDto } from './dto/user.dto';
import { buildPaginationMeta } from '../../common/interfaces/paginated-response';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    constructor(private readonly prisma: PrismaService) { }

    async create(createUserDto: CreateUserDto, currentUserId?: string) {
        const existingUser = await this.prisma.user.findUnique({ where: { email: createUserDto.email } });
        if (existingUser) throw new ConflictException('Email already in use');

        const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
        return this.prisma.user.create({
            data: {
                ...createUserDto,
                password_hash: hashedPassword,
                created_by: currentUserId
            },
            select: { id: true, email: true, full_name: true, status: true, created_at: true }
        });
    }

    async findAll(page = 1, limit = 20) {
        const take = Math.min(limit, 100);
        const skip = (page - 1) * take;
        const [total, data] = await Promise.all([
            this.prisma.user.count(),
            this.prisma.user.findMany({
                select: { id: true, email: true, full_name: true, status: true, created_at: true },
                orderBy: { created_at: 'desc' },
                skip,
                take,
            }),
        ]);
        return { data, meta: buildPaginationMeta(total, page, take) };
    }

    async findOne(id: string) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            include: {
                user_roles: { include: { role: true } },
                user_scopes: { include: { barangay: true, partner: true } }
            }
        });
        if (!user) throw new NotFoundException('User not found');

        // safe return without password hash
        const { password_hash, ...safeUser } = user;
        return safeUser;
    }

    async update(id: string, updateUserDto: UpdateUserDto, currentUserId?: string) {
        await this.findOne(id); // verfiy exists
        return this.prisma.user.update({
            where: { id },
            data: { ...updateUserDto, updated_by: currentUserId },
            select: { id: true, email: true, full_name: true, status: true }
        });
    }

    async deactivate(id: string, currentUserId?: string) {
        return this.prisma.user.update({
            where: { id },
            data: { status: 'INACTIVE', updated_by: currentUserId },
            select: { id: true, status: true }
        });
    }

    async assignRoles(id: string, assignRolesDto: AssignRolesDto) {
        // replace roles
        await this.prisma.userRole.deleteMany({ where: { user_id: id } });

        if (assignRolesDto.roleIds.length > 0) {
            await this.prisma.userRole.createMany({
                data: assignRolesDto.roleIds.map(roleId => ({
                    user_id: id,
                    role_id: roleId,
                }))
            });
        }

        return this.findOne(id);
    }

    async assignScopes(id: string, assignScopesDto: AssignScopesDto) {
        await this.prisma.userScope.deleteMany({ where: { user_id: id } });

        const scopesToCreate: any[] = [];
        if (assignScopesDto.barangayIds) {
            scopesToCreate.push(...assignScopesDto.barangayIds.map(bId => ({
                user_id: id,
                barangay_id: bId
            })));
        }
        if (assignScopesDto.partnerId) {
            scopesToCreate.push({
                user_id: id,
                partner_id: assignScopesDto.partnerId
            });
        }

        if (scopesToCreate.length > 0) {
            await this.prisma.userScope.createMany({ data: scopesToCreate });
        }

        return this.findOne(id);
    }
}
