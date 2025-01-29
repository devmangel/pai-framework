import { IsString, IsOptional, IsObject, IsArray } from 'class-validator';

export class CreateTaskDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsString()
  @IsOptional()
  agentId?: string;

  @IsArray()
  @IsOptional()
  dependencies?: string[];

  @IsObject()
  @IsOptional()
  context?: Record<string, any>;

  @IsObject()
  @IsOptional()
  config?: Record<string, any>;
}
