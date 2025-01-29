import { Test, TestingModule } from '@nestjs/testing';
import { OpenAIService } from '../infrastructure/services/openai.service';
import { ConfigService } from '@nestjs/config';
import { LLMCacheService } from '../infrastructure/services/cache.service';

describe('OpenAIService', () => {
  let service: OpenAIService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OpenAIService,
        {
          provide: ConfigService,
          useValue: {}, // Mock implementation
        },
        {
          provide: LLMCacheService,
          useValue: {}, // Mock implementation
        },
      ],
    }).compile();

    service = module.get<OpenAIService>(OpenAIService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should complete a request', async () => {
    const result = await service.complete({ messages: [{ role: 'user', content: 'Hello' }] });
    expect(result).toBeDefined();
  });
});
