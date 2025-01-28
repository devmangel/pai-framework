import * as Joi from 'joi';

export const validationSchema = Joi.object({
  // AWS Configuration
  AWS_REGION: Joi.string().required(),
  AWS_ACCESS_KEY_ID: Joi.string().required(),
  AWS_SECRET_ACCESS_KEY: Joi.string().required(),

  // DynamoDB Configuration
  DYNAMODB_TABLE_PREFIX: Joi.string().default('dev_'),
  DYNAMODB_ENDPOINT: Joi.string().uri().optional(),

  // Application Configuration
  PORT: Joi.number().default(3000),
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  ALLOWED_ORIGINS: Joi.string().default('*'),

  // LLM Configuration
  OPENAI_API_KEY: Joi.string().optional(),
  ANTHROPIC_API_KEY: Joi.string().optional(),

  // Cache Configuration
  REDIS_HOST: Joi.string().default('localhost'),
  REDIS_PORT: Joi.number().default(6379),

  // WebSocket Configuration
  WS_PORT: Joi.number().default(3001),

  // Rate Limiting
  RATE_LIMIT_TTL: Joi.number().default(60),
  RATE_LIMIT_MAX: Joi.number().default(100),

  // Logging
  LOG_LEVEL: Joi.string()
    .valid('error', 'warn', 'info', 'debug')
    .default('info'),
});

export type EnvConfig = {
  AWS_REGION: string;
  AWS_ACCESS_KEY_ID: string;
  AWS_SECRET_ACCESS_KEY: string;
  DYNAMODB_TABLE_PREFIX: string;
  DYNAMODB_ENDPOINT?: string;
  PORT: number;
  NODE_ENV: 'development' | 'production' | 'test';
  ALLOWED_ORIGINS: string;
  OPENAI_API_KEY?: string;
  ANTHROPIC_API_KEY?: string;
  REDIS_HOST: string;
  REDIS_PORT: number;
  WS_PORT: number;
  RATE_LIMIT_TTL: number;
  RATE_LIMIT_MAX: number;
  LOG_LEVEL: 'error' | 'warn' | 'info' | 'debug';
};
