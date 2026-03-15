import { Test, TestingModule } from '@nestjs/testing';
import { SubscriberAuthController } from './subscriber-auth.controller';
import { SubscriberAuthService } from './subscriber-auth.service';

describe('SubscriberAuthController', () => {
  let controller: SubscriberAuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SubscriberAuthController],
      providers: [
        { provide: SubscriberAuthService, useValue: { login: jest.fn() } },
      ],
    }).compile();

    controller = module.get<SubscriberAuthController>(SubscriberAuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
