import {
  Controller, Get, Post, Body, Patch, Param,
  UseGuards, UsePipes,
} from '@nestjs/common';
import { PlansService } from './plans.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { createPlanSchema, updatePlanSchema, createPromoSchema } from './dto/plan.dto';
import type { CreatePlanDto, UpdatePlanDto, CreatePromoDto } from './dto/plan.dto';
import type { AuthUser } from '../../common/interfaces/auth-user';

@Controller('plans')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  @Post()
  @Permissions('plans.plan.create')
  @UsePipes(new ZodValidationPipe(createPlanSchema))
  create(@Body() dto: CreatePlanDto, @CurrentUser() user: AuthUser) {
    return this.plansService.create(dto, user.id);
  }

  @Get()
  @Permissions('plans.plan.list')
  findAll() {
    return this.plansService.findAll();
  }

  @Get(':id')
  @Permissions('plans.plan.view')
  findOne(@Param('id') id: string) {
    return this.plansService.findOne(id);
  }

  @Patch(':id')
  @Permissions('plans.plan.update')
  @UsePipes(new ZodValidationPipe(updatePlanSchema))
  update(
    @Param('id') id: string,
    @Body() dto: UpdatePlanDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.plansService.update(id, dto, user.id);
  }

  @Get(':id/promos')
  @Permissions('plans.promo.manage')
  getPromos(@Param('id') planId: string) {
    return this.plansService.getPromos(planId);
  }

  @Post(':id/promos')
  @Permissions('plans.promo.manage')
  @UsePipes(new ZodValidationPipe(createPromoSchema))
  createPromo(
    @Param('id') planId: string,
    @Body() dto: CreatePromoDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.plansService.createPromo(planId, dto);
  }
}
