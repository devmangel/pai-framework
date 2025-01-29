import { Injectable, Inject } from '@nestjs/common';
import { BaseTool, ToolResult, ToolContext } from '../../infrastructure/tools/base.tool';
import { Tool } from '../../domain/entities/tool.entity';
import { ToolType, ToolCategory } from '../../domain/enums/tool-type.enum';

@Injectable()
export class ToolService {
  constructor(
    @Inject('TOOLS')
    private readonly tools: BaseTool[],
  ) {}

  // Get all available tools
  public getTools(): Tool[] {
    return this.tools.map(tool => tool.getToolInfo());
  }

  // Find a tool by ID
  public findTool(id: string): BaseTool | undefined {
    return this.tools.find(tool => tool.getToolInfo().getId() === id);
  }

  // Execute a tool by ID
  public async executeTool(
    id: string,
    args: Record<string, any>,
    context?: ToolContext,
  ): Promise<ToolResult> {
    const tool = this.findTool(id);
    if (!tool) {
      return {
        success: false,
        error: `Tool with ID '${id}' not found`,
        timestamp: new Date(),
      };
    }

    return await tool.run(args, context);
  }

  // Filter tools by type
  public getToolsByType(type: ToolType): Tool[] {
    return this.tools
      .filter(tool => tool.getToolInfo().getType() === type)
      .map(tool => tool.getToolInfo());
  }

  // Filter tools by category
  public getToolsByCategory(category: ToolCategory): Tool[] {
    return this.tools
      .filter(tool => tool.getToolInfo().getCategory() === category)
      .map(tool => tool.getToolInfo());
  }

  // Search tools by name or description
  public searchTools(query: string): Tool[] {
    const lowercaseQuery = query.toLowerCase();
    return this.tools
      .filter(tool => {
        const info = tool.getToolInfo();
        return (
          info.getName().toLowerCase().includes(lowercaseQuery) ||
          info.getDescription().toLowerCase().includes(lowercaseQuery)
        );
      })
      .map(tool => tool.getToolInfo());
  }

  // Get tool metadata
  public getToolMetadata(id: string): Record<string, any> | undefined {
    const tool = this.findTool(id);
    if (!tool) {
      return undefined;
    }

    const info = tool.getToolInfo();
    return {
      ...info.getMetadata(),
      type: info.getType(),
      category: info.getCategory(),
      arguments: info.getArguments(),
    };
  }

  // Configure tool cache
  public configureToolCache(
    id: string,
    enabled: boolean,
    ttl?: number,
  ): boolean {
    const tool = this.findTool(id);
    if (!tool) {
      return false;
    }

    if (enabled) {
      tool.enableCache();
      if (ttl) {
        tool.setCacheConfig({ ttl });
      }
    } else {
      tool.disableCache();
    }

    return true;
  }

  // Batch execute tools
  public async executeTools(
    executions: Array<{
      id: string;
      args: Record<string, any>;
      context?: ToolContext;
    }>,
  ): Promise<ToolResult[]> {
    return await Promise.all(
      executions.map(({ id, args, context }) =>
        this.executeTool(id, args, context),
      ),
    );
  }
}
