import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { BarangaysModule } from './modules/barangays/barangays.module';
import { PartnersModule } from './modules/partners/partners.module';
import { AgreementsModule } from './modules/agreements/agreements.module';
import { PlansModule } from './modules/plans/plans.module';
import { AuditModule } from './modules/audit/audit.module';
import { SettingsModule } from './modules/settings/settings.module';
// Phase 1 modules
import { SubscribersModule } from './modules/subscribers/subscribers.module';
import { NetworkAssetsModule } from './modules/network-assets/network-assets.module';
import { InstallationsModule } from './modules/installations/installations.module';
import { TicketsModule } from './modules/tickets/tickets.module';
import { DashboardsModule } from './modules/dashboards/dashboards.module';
// Phase 2 modules
import { BillingModule } from './modules/billing/billing.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { SuspensionModule } from './modules/suspension/suspension.module';
// Phase 3 modules
import { SettlementsModule } from './modules/settlements/settlements.module';
// Phase 4 modules
import { ReportsModule } from './modules/reports/reports.module';
import { MapsModule } from './modules/maps/maps.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { CorrelationIdMiddleware } from './common/middleware/correlation-id.middleware';
import { AuditInterceptor } from './common/interceptors/audit.interceptor';
import { SubscriberAuthModule } from './modules/subscriber-auth/subscriber-auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    DatabaseModule,
    AuthModule,
    UsersModule,
    BarangaysModule,
    PartnersModule,
    AgreementsModule,
    PlansModule,
    AuditModule,
    SettingsModule,
    // Phase 1
    SubscribersModule,
    NetworkAssetsModule,
    InstallationsModule,
    TicketsModule,
    DashboardsModule,
    // Phase 2
    BillingModule,
    PaymentsModule,
    SuspensionModule,
    // Phase 3
    SettlementsModule,
    // Phase 4
    ReportsModule,
    MapsModule,
    NotificationsModule,
    SubscriberAuthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Global audit interceptor (needs DI for PrismaService)
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorrelationIdMiddleware).forRoutes('*');
  }
}
