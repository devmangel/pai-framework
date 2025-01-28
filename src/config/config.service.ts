import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';
import { EnvConfig } from './validation.schema';

@Injectable()
export class ConfigService {
  constructor(private configService: NestConfigService<EnvConfig>) {}

  get awsConfig() {
    return {
      region: this.configService.get<string>('AWS_REGION'),
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY'),
      },
    };
  }

  get dynamoDBConfig() {
    return {
      tablePrefix: this.configService.get<string>('DYNAMODB_TABLE_PREFIX'),
      endpoint: this.configService.get<string>('DYNAMODB_ENDPOINT'),
    };
  }

  get appConfig() {
    return {
      port: this.configService.get<number>('PORT'),
      nodeEnv: this.configService.get<string>('NODE_ENV'),
      allowedOrigins: this.configService.get<string>('ALLOWED_ORIGINS').split(','),
    };
  }

  get llmConfig() {
    return {
      openaiApiKey: this.configService.get<string>('OPENAI_API_KEY'),
      anthropicApiKey: this.configService.get<string>('ANTHROPIC_API_KEY'),
    };
  }

  get cacheConfig() {
    return {
      host: this.configService.get<string>('REDIS_HOST'),
      port: this.configService.get<number>('REDIS_PORT'),
    };
  }

  get wsConfig() {
    return {
      port: this.configService.get<number>('WS_PORT'),
    };
  }

  get rateLimitConfig() {
    return {
      ttl: this.configService.get<number>('RATE_LIMIT_TTL'),
      max: this.configService.get<number>('RATE_LIMIT_MAX'),
    };
  }

  get logConfig() {
    return {
      level: this.configService.get<string>('LOG_LEVEL'),
    };
  }

  get isDevelopment(): boolean {
    return this.configService.get<string>('NODE_ENV') === 'development';
  }

  get isProduction(): boolean {
    return this.configService.get<string>('NODE_ENV') === 'production';
  }

  get isTest(): boolean {
    return this.configService.get<string>('NODE_ENV') === 'test';
  }
}
