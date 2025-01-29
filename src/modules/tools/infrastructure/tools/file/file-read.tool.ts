import { Injectable } from '@nestjs/common';
import { readFile } from 'fs/promises';
import { BaseTool, ToolResult, ToolContext } from '../base.tool';
import { ToolType, ToolCategory } from '../../../domain/enums/tool-type.enum';
import { Cache } from 'cache-manager';
import { ToolMetadata } from '../../../domain/entities/tool.entity';

@Injectable()
export class FileReadTool extends BaseTool {
  constructor(cacheManager: Cache) {
    super(
      cacheManager,
      'file-read',
      'File Read Tool',
      'Reads the content of a file from the filesystem',
      ToolType.FILE,
      ToolCategory.READ,
      [
        {
          name: 'path',
          type: 'string',
          description: 'Path to the file to read',
          required: true,
        },
        {
          name: 'encoding',
          type: 'string',
          description: 'File encoding (default: utf-8)',
          required: false,
          default: 'utf-8',
        },
      ],
      'readFile',
      {
        version: '1.0.0',
        author: 'AgentsAI',
        license: 'MIT',
        tags: ['file', 'read', 'filesystem'],
        documentation: 'Tool for reading file contents with support for different encodings',
      } as ToolMetadata,
    );

    // Configure specific cache settings for file read operations
    this.setCacheConfig({
      ttl: 300, // 5 minutes cache
      keyPrefix: 'file-read',
    });
  }

  protected async execute(
    args: Record<string, any>,
    context?: ToolContext,
  ): Promise<ToolResult> {
    const startTime = Date.now();

    try {
      const { path, encoding = 'utf-8' } = args;

      // Read file content
      const content = await readFile(path, { encoding });

      return {
        success: true,
        data: content,
        metadata: {
          path,
          encoding,
          size: Buffer.from(content).length,
          executionTime: Date.now() - startTime,
          context,
        },
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to read file: ${error.message}`,
        metadata: {
          path: args.path,
          executionTime: Date.now() - startTime,
          context,
        },
        timestamp: new Date(),
      };
    }
  }
}
