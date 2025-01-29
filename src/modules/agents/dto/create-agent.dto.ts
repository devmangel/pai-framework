import { IsString, IsOptional, IsObject } from 'class-validator';

export class CreateAgentDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsString()
  role: string;

  @IsObject()
  @IsOptional()
  config?: Record<string, any>;

  @IsString()
  @IsOptional()
  llmProvider?: string;
}
