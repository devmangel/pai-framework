import { IsString, IsOptional, IsEnum, IsObject } from 'class-validator';
import { TaskPriority } from '../../../domain/enums/task-priority.enum';

export class UpdateTaskDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: TaskPriority;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}
