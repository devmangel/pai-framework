import { Module } from '@nestjs/common';
import { ConfigModule } from '../../config/config.module';
import { TaskServiceImpl } from './infrastructure/services/task.service';
import { DynamoDBTaskRepository } from './infrastructure/repositories/dynamodb-task.repository';
import { TasksController } from './interface/http/tasks.controller';
import { TaskExceptionFilter } from './interface/http/filters/task-exception.filter';
import { APP_FILTER } from '@nestjs/core';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'TaskService',
      useClass: TaskServiceImpl,
    },
    {
      provide: 'TaskRepository',
      useClass: DynamoDBTaskRepository,
    },
    {
      provide: APP_FILTER,
      useClass: TaskExceptionFilter,
    },
  ],
  controllers: [TasksController],
  exports: ['TaskService'],
})
export class TasksModule {
  static forRoot(options?: {
    repository?: 'dynamodb' | 'memory' | 'custom';
    config?: Record<string, any>;
  }) {
    return {
      module: TasksModule,
      imports: [ConfigModule],
      providers: [
        {
          provide: 'TaskService',
          useClass: TaskServiceImpl,
        },
        {
          provide: 'TaskRepository',
          useClass: options?.repository === 'memory'
            ? DynamoDBTaskRepository // TODO: Replace with MemoryTaskRepository when implemented
            : DynamoDBTaskRepository,
        },
        {
          provide: 'TASK_CONFIG',
          useValue: options?.config || {},
        },
        {
          provide: APP_FILTER,
          useClass: TaskExceptionFilter,
        },
      ],
      controllers: [TasksController],
    };
  }

  static forFeature() {
    return {
      module: TasksModule,
      exports: ['TaskService'],
    };
  }
}
