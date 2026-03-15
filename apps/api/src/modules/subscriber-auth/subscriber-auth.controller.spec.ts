import { Test, TestingModule } from '@nestjs/testing';
import { SubscriberAuthController } from './subscriber-auth.controller';

describe('SubscriberAuthController', () => {
  let controller: SubscriberAuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SubscriberAuthController],
    }).compile();

    controller = module.get<SubscriberAuthController>(SubscriberAuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
