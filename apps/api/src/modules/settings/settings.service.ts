import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

/**
 * Phase 0 Settings Service
 * Manages system-level configuration settings backed by the database.
 * Falls back to hardcoded defaults if no database entry exists.
 */
const DEFAULTS: Record<string, string> = {
  'system.name': 'FiberOps PH',
  'system.timezone': 'Asia/Manila',
  'billing.grace_period_days': '7',
  'billing.penalty_percentage': '5.00',
  'billing.auto_suspend_days': '30',
  'installation.sla_days': '7',
  'ticket.sla_hours': '24',
  'settlement.frequency': 'MONTHLY',
};

@Injectable()
export class SettingsService {
  private readonly logger = new Logger(SettingsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getSettings(): Promise<Record<string, string>> {
    const dbSettings = await this.prisma.systemSetting.findMany();
    const result = { ...DEFAULTS };
    for (const s of dbSettings) {
      result[s.key] = s.value;
    }
    return result;
  }

  async getSetting(key: string): Promise<string | undefined> {
    const dbSetting = await this.prisma.systemSetting.findUnique({
      where: { key },
    });
    return dbSetting?.value ?? DEFAULTS[key];
  }

  async updateSettings(
    updates: Record<string, string>,
    userId?: string,
  ): Promise<Record<string, string>> {
    for (const [key, value] of Object.entries(updates)) {
      await this.prisma.systemSetting.upsert({
        where: { key },
        update: { value, updated_by: userId },
        create: { key, value, updated_by: userId },
      });
      this.logger.log(`Setting updated: ${key} = ${value}`);
    }
    return this.getSettings();
  }
}
