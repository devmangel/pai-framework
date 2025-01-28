import { Module } from '@nestjs/common';
import { ConfigModule } from '../../config/config.module';
import { CacheModule } from '@nestjs/cache-manager';
import { OpenAIService } from './infrastructure/services/openai.service';
import { LLMController } from './interface/http/llm.controller';
import { LLMCacheService } from './infrastructure/services/cache.service';

@Module({
  imports: [
    ConfigModule,
    CacheModule.register({
      ttl: 3600, // Default cache TTL: 1 hour
      max: 100, // Maximum number of items in cache
    }),
  ],
  controllers: [LLMController],
  providers: [
    {
      provide: 'LLMService',
      useClass: OpenAIService,
    },
    LLMCacheService,
  ],
  exports: ['LLMService'],
})
export class LLMModule {
  static forRoot(options?: {
    provider?: 'openai' | 'anthropic' | 'custom';
    config?: Record<string, any>;
    cache?: {
      ttl?: number;
      max?: number;
    };
  }) {
    return {
      module: LLMModule,
      imports: [
        ConfigModule,
        CacheModule.register({
          ttl: options?.cache?.ttl || 3600,
          max: options?.cache?.max || 100,
        }),
      ],
      providers: [
        {
          provide: 'LLMService',
          useClass: options?.provider === 'anthropic' 
            ? OpenAIService // TODO: Replace with Anthropic service when implemented
            : OpenAIService,
        },
        {
          provide: 'LLM_CONFIG',
          useValue: options?.config || {},
        },
        LLMCacheService,
      ],
    };
  }

  static forFeature() {
    return {
      module: LLMModule,
      exports: ['LLMService'],
    };
  }
}
