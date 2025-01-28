import { IsString, IsNotEmpty, IsEnum, IsOptional, IsArray, IsObject } from 'class-validator';
import { TaskPriority } from '../../../domain/enums/task-priority.enum';

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsEnum(TaskPriority)
  priority: TaskPriority;

  @IsString()
  @IsOptional()
  parentId?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  dependencies?: string[];

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}
