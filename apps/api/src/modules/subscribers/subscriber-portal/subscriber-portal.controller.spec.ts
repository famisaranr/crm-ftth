import { Test, TestingModule } from '@nestjs/testing';
import { SubscriberPortalController } from './subscriber-portal.controller';

describe('SubscriberPortalController', () => {
  let controller: SubscriberPortalController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SubscriberPortalController],
    }).compile();

    controller = module.get<SubscriberPortalController>(SubscriberPortalController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
