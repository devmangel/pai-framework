import { IsString, IsArray, IsOptional, IsNumber, ValidateNested, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { LLMConfig } from '../../../domain/entities/llm-provider.entity';

export class MessageDto {
  @IsEnum(['system', 'user', 'assistant'])
  role: 'system' | 'user' | 'assistant';

  @IsString()
  content: string;
}

export class CompletionConfigDto implements Partial<LLMConfig> {
  @IsNumber()
  @IsOptional()
  maxTokens?: number;

  @IsNumber()
  @IsOptional()
  temperature?: number;

  @IsNumber()
  @IsOptional()
  topP?: number;

  @IsNumber()
  @IsOptional()
  frequencyPenalty?: number;

  @IsNumber()
  @IsOptional()
  presencePenalty?: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  stop?: string[];

  @IsNumber()
  @IsOptional()
  timeout?: number;
}

export class CompletionRequestDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MessageDto)
  messages: MessageDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => CompletionConfigDto)
  config?: CompletionConfigDto;

  @IsString()
  @IsOptional()
  model?: string;
}

export class TokenCountResponseDto {
  @IsNumber()
  count: number;
}

export class CostEstimateResponseDto {
  @IsNumber()
  cost: number;

  @IsString()
  currency: string;
}

export class ProviderStatusResponseDto {
  isValid: boolean;
  provider: string;
  rateLimit: {
    remaining: number;
    reset: Date;
    limit: number;
  };
}
