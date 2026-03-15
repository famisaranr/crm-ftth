import { Module } from '@nestjs/common';
import { NetworkAssetsController } from './network-assets.controller';
import { NetworkAssetsService } from './network-assets.service';
import { DatabaseModule } from '../../database/database.module';

@Module({
    imports: [DatabaseModule],
    controllers: [NetworkAssetsController],
    providers: [NetworkAssetsService],
    exports: [NetworkAssetsService],
})
export class NetworkAssetsModule {}
