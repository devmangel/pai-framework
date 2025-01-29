import { Injectable } from '@nestjs/common';
import { Tool, ToolArgument, ToolMetadata } from '../../domain/entities/tool.entity';
import { ToolType, ToolCategory } from '../../domain/enums/tool-type.enum';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Inject } from '@nestjs/common';

export interface ToolResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  metadata?: Record<string, any>;
  timestamp: Date;
}

export interface CacheConfig {
  enabled: boolean;
  ttl: number;
  keyPrefix?: string;
}

export interface ToolContext {
  agentId?: string;
  teamId?: string;
  taskId?: string;
  metadata?: Record<string, any>;
}

@Injectable()
export abstract class BaseTool {
  protected tool: Tool;
  protected cacheConfig: CacheConfig = {
    enabled: true,
    ttl: 3600, // 1 hour default
  };

  constructor(
    @Inject(CACHE_MANAGER) protected readonly cacheManager: Cache,
    id: string,
    name: string,
    description: string,
    type: ToolType,
    category: ToolCategory,
    args: ToolArgument[],
    functionName: string,
    metadata: ToolMetadata,
  ) {
    this.tool = Tool.create(
      id,
      name,
      description,
      type,
      category,
      args,
      functionName,
      metadata,
    );
  }

  // Abstract method that must be implemented by concrete tools
  protected abstract execute(
    args: Record<string, any>,
    context?: ToolContext,
  ): Promise<ToolResult>;

  // Public method to run the tool with caching and error handling
  public async run(
    args: Record<string, any>,
    context?: ToolContext,
  ): Promise<ToolResult> {
    try {
      // Validate arguments
      this.tool.validateArguments(args);

      // Check cache if enabled
      if (this.cacheConfig.enabled) {
        const cacheKey = this.generateCacheKey(args);
        const cachedResult = await this.cacheManager.get<ToolResult>(cacheKey);
        if (cachedResult) {
          return {
            ...cachedResult,
            metadata: {
              ...cachedResult.metadata,
              cached: true,
            },
          };
        }
      }

      // Execute tool
      const result = await this.execute(args, context);

      // Cache result if enabled
      if (this.cacheConfig.enabled && result.success) {
        const cacheKey = this.generateCacheKey(args);
        await this.cacheManager.set(cacheKey, result, this.cacheConfig.ttl);
      }

      return result;
    } catch (error) {
      return {
        success: false,
        error: error.message,
        timestamp: new Date(),
      };
    }
  }

  // Cache key generation
  protected generateCacheKey(args: Record<string, any>): string {
    const prefix = this.cacheConfig.keyPrefix || this.tool.getId();
    const argsKey = JSON.stringify(args);
    return `${prefix}:${argsKey}`;
  }

  // Configuration methods
  public setCacheConfig(config: Partial<CacheConfig>): void {
    this.cacheConfig = {
      ...this.cacheConfig,
      ...config,
    };
  }

  public disableCache(): void {
    this.cacheConfig.enabled = false;
  }

  public enableCache(): void {
    this.cacheConfig.enabled = true;
  }

  // Tool information methods
  public getToolInfo(): Tool {
    return this.tool;
  }

  public getArguments(): ToolArgument[] {
    return this.tool.getArguments();
  }

  public getDescription(): string {
    return this.tool.getDescription();
  }

  public getMetadata(): ToolMetadata {
    return this.tool.getMetadata();
  }
}
