import { Module } from '@nestjs/common';
import { SubscribersController } from './subscribers.controller';
import { SubscribersService } from './subscribers.service';
import { DatabaseModule } from '../../database/database.module';
import { SubscriberPortalController } from './subscriber-portal/subscriber-portal.controller';
import { JwtModule } from '@nestjs/jwt';

@Module({
    imports: [DatabaseModule, JwtModule.register({})],
    controllers: [SubscribersController, SubscriberPortalController],
    providers: [SubscribersService],
    exports: [SubscribersService],
})
export class SubscribersModule {}
