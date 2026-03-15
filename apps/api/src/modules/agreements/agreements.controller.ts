import {
  Controller, Get, Post, Body, Patch, Param,
  UseGuards, UsePipes,
} from '@nestjs/common';
import { AgreementsService } from './agreements.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { createAgreementSchema, updateAgreementStatusSchema } from './dto/agreement.dto';
import type { CreateAgreementDto, UpdateAgreementStatusDto } from './dto/agreement.dto';
import type { AuthUser } from '../../common/interfaces/auth-user';

@Controller('agreements')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class AgreementsController {
  constructor(private readonly agreementsService: AgreementsService) {}

  @Post()
  @Permissions('agreements.agreement.create')
  @UsePipes(new ZodValidationPipe(createAgreementSchema))
  create(@Body() dto: CreateAgreementDto, @CurrentUser() user: AuthUser) {
    return this.agreementsService.create(dto, user.id);
  }

  @Get()
  @Permissions('agreements.agreement.list')
  findAll() {
    return this.agreementsService.findAll();
  }

  @Get(':id')
  @Permissions('agreements.agreement.view')
  findOne(@Param('id') id: string) {
    return this.agreementsService.findOne(id);
  }

  @Patch(':id')
  @Permissions('agreements.agreement.update')
  @UsePipes(new ZodValidationPipe(updateAgreementStatusSchema))
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateAgreementStatusDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.agreementsService.updateStatus(id, dto, user.id);
  }
}
