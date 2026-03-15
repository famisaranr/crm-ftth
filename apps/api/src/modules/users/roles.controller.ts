import { Controller, Get, Post, Body, Param, UseGuards, UsePipes } from '@nestjs/common';
import { RolesService, createRoleSchema } from './roles.service';
import type { CreateRoleDto } from './roles.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { PrismaService } from '../../database/prisma.service';

@Controller('roles')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class RolesController {
  constructor(
    private readonly rolesService: RolesService,
    private readonly prisma: PrismaService,
  ) {}

  @Post()
  @Permissions('users.role.manage')
  @UsePipes(new ZodValidationPipe(createRoleSchema))
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.rolesService.create(createRoleDto);
  }

  @Get()
  @Permissions('users.role.list')
  findAll() {
    return this.rolesService.findAll();
  }

  @Get(':id')
  @Permissions('users.role.list')
  findOne(@Param('id') id: string) {
    return this.rolesService.findOne(id);
  }

  /**
   * GET /api/v1/permissions
   * List all available permissions in the system
   */
  @Get('/permissions/all')
  @Permissions('users.role.manage')
  listPermissions() {
    return this.prisma.permission.findMany({
      orderBy: [{ module: 'asc' }, { action: 'asc' }],
    });
  }
}
