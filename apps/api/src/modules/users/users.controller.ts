import {
  Controller, Get, Post, Body, Patch, Delete, Param, Query,
  UseGuards, UsePipes,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import {
  createUserSchema, updateUserSchema,
  assignRolesSchema, assignScopesSchema,
} from './dto/user.dto';
import type {
  CreateUserDto, UpdateUserDto,
  AssignRolesDto, AssignScopesDto,
} from './dto/user.dto';
import type { AuthUser } from '../../common/interfaces/auth-user';

@Controller('users')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Permissions('users.user.create')
  @UsePipes(new ZodValidationPipe(createUserSchema))
  create(@Body() createUserDto: CreateUserDto, @CurrentUser() user: AuthUser) {
    return this.usersService.create(createUserDto, user.id);
  }

  @Get()
  @Permissions('users.user.list')
  findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.usersService.findAll(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );
  }

  @Get(':id')
  @Permissions('users.user.view')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @Permissions('users.user.update')
  @UsePipes(new ZodValidationPipe(updateUserSchema))
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.usersService.update(id, updateUserDto, user.id);
  }

  @Patch(':id/deactivate')
  @Permissions('users.user.deactivate')
  deactivate(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.usersService.deactivate(id, user.id);
  }

  @Post(':id/roles')
  @Permissions('users.role.manage')
  @UsePipes(new ZodValidationPipe(assignRolesSchema))
  assignRoles(@Param('id') id: string, @Body() dto: AssignRolesDto) {
    return this.usersService.assignRoles(id, dto);
  }

  @Post(':id/scopes')
  @Permissions('users.user.update')
  @UsePipes(new ZodValidationPipe(assignScopesSchema))
  assignScopes(@Param('id') id: string, @Body() dto: AssignScopesDto) {
    return this.usersService.assignScopes(id, dto);
  }
}
