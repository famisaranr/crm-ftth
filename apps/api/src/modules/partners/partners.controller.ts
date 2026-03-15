import {
  Controller, Get, Post, Body, Patch, Param,
  UseGuards, UsePipes,
} from '@nestjs/common';
import { PartnersService } from './partners.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { createPartnerSchema, updatePartnerSchema } from './dto/partner.dto';
import type { CreatePartnerDto, UpdatePartnerDto } from './dto/partner.dto';
import type { AuthUser } from '../../common/interfaces/auth-user';

@Controller('partners')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class PartnersController {
  constructor(private readonly partnersService: PartnersService) {}

  @Post()
  @Permissions('partners.partner.create')
  @UsePipes(new ZodValidationPipe(createPartnerSchema))
  create(@Body() dto: CreatePartnerDto, @CurrentUser() user: AuthUser) {
    return this.partnersService.create(dto, user.id);
  }

  @Get()
  @Permissions('partners.partner.list')
  findAll() {
    return this.partnersService.findAll();
  }

  @Get(':id')
  @Permissions('partners.partner.view')
  findOne(@Param('id') id: string) {
    return this.partnersService.findOne(id);
  }

  @Patch(':id')
  @Permissions('partners.partner.update')
  @UsePipes(new ZodValidationPipe(updatePartnerSchema))
  update(
    @Param('id') id: string,
    @Body() dto: UpdatePartnerDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.partnersService.update(id, dto, user.id);
  }
}
