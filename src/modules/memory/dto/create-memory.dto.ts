import { IsString, IsOptional, IsObject, IsArray } from 'class-validator';

export class CreateMemoryDto {
  @IsString()
  content: string;

  @IsString()
  @IsOptional()
  agentId?: string;

  @IsString()
  @IsOptional()
  taskId?: string;

  @IsArray()
  @IsOptional()
  tags?: string[];

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;

  @IsString()
  @IsOptional()
  type?: 'conversation' | 'task_result' | 'observation' | 'knowledge';
}
