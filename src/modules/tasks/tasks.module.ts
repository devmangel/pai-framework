import { Module } from '@nestjs/common';
import { TasksController } from './tasks.controller';

@Module({
  controllers: [TasksController],
  providers: [], // TODO: Add TasksService
  exports: [] // TODO: Export TasksService
})
export class TasksModule {}
