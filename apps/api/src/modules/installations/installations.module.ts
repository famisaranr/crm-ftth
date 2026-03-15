import { Module } from '@nestjs/common';
import { InstallationsController } from './installations.controller';
import { InstallationsService } from './installations.service';
import { DatabaseModule } from '../../database/database.module';

@Module({
    imports: [DatabaseModule],
    controllers: [InstallationsController],
    providers: [InstallationsService],
    exports: [InstallationsService],
})
export class InstallationsModule {}
