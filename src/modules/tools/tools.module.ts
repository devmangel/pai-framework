import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule } from '@nestjs/config';
import { FileReadTool } from './infrastructure/tools/file/file-read.tool';
import { ToolService } from './application/services/tool.service';
import { ToolsController } from './interface/http/tools.controller';

@Module({
  imports: [
    ConfigModule,
    CacheModule.register({
      ttl: 3600, // 1 hour default TTL
      max: 100, // Maximum number of items in cache
      isGlobal: true,
    }),
  ],
  controllers: [ToolsController],
  providers: [
    FileReadTool,
    ToolService,
    {
      provide: 'TOOLS',
      useFactory: (...tools) => tools,
      inject: [FileReadTool], // Add new tools here as they are created
    },
  ],
  exports: [
    ToolService,
    'TOOLS',
    FileReadTool, // Export individual tools
  ],
})
export class ToolsModule {}
