import { Module } from '@nestjs/common';
import { MemoryController } from './memory.controller';

@Module({
  controllers: [MemoryController],
  providers: [], // TODO: Add MemoryService
  exports: [] // TODO: Export MemoryService
})
export class MemoryModule {}
