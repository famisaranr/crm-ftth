import { Test, TestingModule } from '@nestjs/testing';
import { SubscriberPortalController } from './subscriber-portal.controller';
import { PrismaService } from '../../../database/prisma.service';
import { createMockPrismaService } from '../../../../test/helpers/mock-prisma';

describe('SubscriberPortalController', () => {
  let controller: SubscriberPortalController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SubscriberPortalController],
      providers: [
        { provide: PrismaService, useValue: createMockPrismaService() },
      ],
    }).compile();

    controller = module.get<SubscriberPortalController>(SubscriberPortalController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
