import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthUser } from '../../common/interfaces/auth-user';

@Controller('settings')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  /**
   * GET /api/v1/settings
   * Returns all system settings
   */
  @Get()
  @Permissions('settings.system.manage')
  async getSettings() {
    return this.settingsService.getSettings();
  }

  /**
   * PATCH /api/v1/settings
   * Updates system settings (key-value pairs)
   */
  @Patch()
  @Permissions('settings.system.manage')
  async updateSettings(
    @Body() updates: Record<string, string>,
    @CurrentUser() user: AuthUser,
  ) {
    return this.settingsService.updateSettings(updates, user.id);
  }
}
