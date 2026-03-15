import {
  Controller, Get, Post, Body, Patch, Param,
  UseGuards, UsePipes,
} from '@nestjs/common';
import { BarangaysService } from './barangays.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { createBarangaySchema, updateBarangaySchema } from './dto/barangay.dto';
import type { CreateBarangayDto, UpdateBarangayDto } from './dto/barangay.dto';
import type { AuthUser } from '../../common/interfaces/auth-user';

@Controller('barangays')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class BarangaysController {
  constructor(private readonly barangaysService: BarangaysService) {}

  @Post()
  @Permissions('barangays.barangay.create')
  @UsePipes(new ZodValidationPipe(createBarangaySchema))
  create(@Body() dto: CreateBarangayDto, @CurrentUser() user: AuthUser) {
    return this.barangaysService.create(dto, user.id);
  }

  @Get()
  @Permissions('barangays.barangay.list')
  findAll() {
    return this.barangaysService.findAll();
  }

  @Get(':id')
  @Permissions('barangays.barangay.view')
  findOne(@Param('id') id: string) {
    return this.barangaysService.findOne(id);
  }

  @Patch(':id')
  @Permissions('barangays.barangay.update')
  @UsePipes(new ZodValidationPipe(updateBarangaySchema))
  update(
    @Param('id') id: string,
    @Body() dto: UpdateBarangayDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.barangaysService.update(id, dto, user.id);
  }

  @Get(':id/zones')
  @Permissions('barangays.zone.list')
  getZones(@Param('id') id: string) {
    return this.barangaysService.getZones(id);
  }

  @Post(':id/zones')
  @Permissions('barangays.zone.manage')
  @UsePipes(new ZodValidationPipe(createBarangaySchema)) // TODO: separate zone schema
  createZone(
    @Param('id') barangayId: string,
    @Body() body: { name: string; description?: string },
    @CurrentUser() user: AuthUser,
  ) {
    return this.barangaysService.createZone(barangayId, body);
  }
}
