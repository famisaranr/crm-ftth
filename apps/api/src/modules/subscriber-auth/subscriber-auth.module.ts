import { Module } from '@nestjs/common';
import { SubscriberAuthController } from './subscriber-auth.controller';
import { SubscriberAuthService } from './subscriber-auth.service';
import { JwtModule } from '@nestjs/jwt';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [
    DatabaseModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'super_secret_jwt_key_2026_fiberops',
    }),
  ],
  controllers: [SubscriberAuthController],
  providers: [SubscriberAuthService]
})
export class SubscriberAuthModule {}
