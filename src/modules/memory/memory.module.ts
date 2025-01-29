import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import * as Joi from 'joi';

const memoryConfigValidationSchema = Joi.object({
  MEMORY_ENABLED: Joi.boolean().default(true),
  MEMORY_DEBUG: Joi.boolean().default(false),
  MEMORY_MAX_SIZE: Joi.number().default(1024 * 1024 * 1024), // 1GB
  MEMORY_BACKUP_ENABLED: Joi.boolean().default(true),
  MEMORY_BACKUP_PATH: Joi.string(),
  MEMORY_ENCRYPTION_ENABLED: Joi.boolean().default(false),
  MEMORY_ENCRYPTION_KEY_PATH: Joi.string(),
  
  // Storage configurations
  CHROMA_HOST: Joi.string(),
  CHROMA_PORT: Joi.number(),
  SQLITE_PATH: Joi.string(),
  REDIS_HOST: Joi.string(),
  REDIS_PORT: Joi.number(),
  
  // Embedding configurations
  EMBEDDING_PROVIDER: Joi.string().valid('openai', 'huggingface', 'cohere', 'custom'),
  EMBEDDING_MODEL: Joi.string(),
  EMBEDDING_API_KEY: Joi.string(),
  EMBEDDING_DIMENSIONS: Joi.number(),
  
  // Performance tuning
  MEMORY_MAX_CONCURRENT_OPS: Joi.number().default(10),
  MEMORY_BATCH_SIZE: Joi.number().default(100),
  MEMORY_CACHE_SIZE: Joi.number().default(1000),
  MEMORY_COMPRESSION_LEVEL: Joi.number().min(0).max(9).default(6),
});

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: memoryConfigValidationSchema,
      validationOptions: {
        allowUnknown: true,
        abortEarly: true,
      },
    }),
    CacheModule.register({
      ttl: 3600, // 1 hour default TTL
      max: 100, // Maximum number of items in cache
      isGlobal: true,
    }),
  ],
  providers: [
    // Core providers - will be implemented next
    // {
    //   provide: 'MEMORY_CONFIG',
    //   useFactory: (configService: ConfigService) => ({
    //     // Configuration factory
    //   }),
    //   inject: [ConfigService],
    // },
    // {
    //   provide: 'MEMORY_REPOSITORY',
    //   useClass: ChromaMemoryRepository,
    // },
    // {
    //   provide: 'EMBEDDING_SERVICE',
    //   useClass: OpenAIEmbeddingService,
    // },
    // MemoryService,
    // MemoryConfigService,
  ],
  exports: [
    // Will export providers as they are implemented
    // 'MEMORY_CONFIG',
    // 'MEMORY_REPOSITORY',
    // 'EMBEDDING_SERVICE',
    // MemoryService,
  ],
})
export class MemoryModule {
  // Will add lifecycle hooks as needed
  // async onModuleInit() {
  //   // Initialize repositories, validate connections
  // }
  
  // async onModuleDestroy() {
  //   // Cleanup connections, backup if needed
  // }
}
