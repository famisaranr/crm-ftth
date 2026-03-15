import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(PrismaService.name);

    constructor(private configService: ConfigService) {
        try {
            super();
            this.logger.log(`Initialized PrismaClient. Expected connection bound over Docker network configuration.`);
        } catch (e) {
            console.error('FATAL PRISMA INIT ERROR:', e);
            throw e;
        }
    }

    async onModuleInit() {
        try {
            this.logger.log('Starting Prisma connection to PostgreSQL...');
            await this.$connect();
            this.logger.log('Prisma connected successfully.');
        } catch (error) {
            this.logger.error('CRITICAL: Prisma connection failed during onModuleInit:', error);
            throw error;
        }
    }

    async onModuleDestroy() {
        await this.$disconnect();
    }
}






