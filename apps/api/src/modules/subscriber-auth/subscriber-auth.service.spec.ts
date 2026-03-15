import { Test, TestingModule } from '@nestjs/testing';
import { SubscriberAuthService } from './subscriber-auth.service';

describe('SubscriberAuthService', () => {
  let service: SubscriberAuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SubscriberAuthService],
    }).compile();

    service = module.get<SubscriberAuthService>(SubscriberAuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
