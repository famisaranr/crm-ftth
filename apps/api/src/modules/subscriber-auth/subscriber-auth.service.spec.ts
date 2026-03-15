import { Test, TestingModule } from '@nestjs/testing';
import { SubscriberAuthService } from './subscriber-auth.service';
import { PrismaService } from '../../database/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { createMockPrismaService } from '../../../test/helpers/mock-prisma';

describe('SubscriberAuthService', () => {
  let service: SubscriberAuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubscriberAuthService,
        { provide: PrismaService, useValue: createMockPrismaService() },
        { provide: JwtService, useValue: { sign: jest.fn().mockReturnValue('mock-token') } },
      ],
    }).compile();

    service = module.get<SubscriberAuthService>(SubscriberAuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
