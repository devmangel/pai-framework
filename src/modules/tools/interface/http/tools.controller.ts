import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Put,
  ValidationPipe,
  UsePipes,
} from '@nestjs/common';
import { ToolService } from '../../application/services/tool-application.service';
import { ToolType, ToolCategory } from '../../domain/enums/tool-type.enum';
import { ToolContext, ToolResult } from '../../infrastructure/tools/base.tool';

class ExecuteToolDto {
  id: string;
  args: Record<string, any>;
  context?: ToolContext;
}

class BatchExecuteToolsDto {
  executions: ExecuteToolDto[];
}

@Controller('tools')
@UsePipes(new ValidationPipe({ transform: true }))
export class ToolsController {
  constructor(private readonly toolService: ToolService) {}

  @Get()
  getTools() {
    return this.toolService.getTools();
  }

  @Get('type/:type')
  getToolsByType(@Param('type') type: ToolType) {
    return this.toolService.getToolsByType(type);
  }

  @Get('category/:category')
  getToolsByCategory(@Param('category') category: ToolCategory) {
    return this.toolService.getToolsByCategory(category);
  }

  @Get('search')
  searchTools(@Query('query') query: string) {
    return this.toolService.searchTools(query);
  }

  @Get(':id')
  getToolMetadata(@Param('id') id: string) {
    return this.toolService.getToolMetadata(id);
  }

  @Post('execute')
  async executeTool(@Body() dto: ExecuteToolDto): Promise<ToolResult> {
    return await this.toolService.executeTool(dto.id, dto.args, dto.context);
  }

  @Post('execute/batch')
  async executeTools(@Body() dto: BatchExecuteToolsDto): Promise<ToolResult[]> {
    return await this.toolService.executeTools(dto.executions);
  }

  @Put(':id/cache')
  configureToolCache(
    @Param('id') id: string,
    @Body() config: { enabled: boolean; ttl?: number },
  ) {
    return this.toolService.configureToolCache(id, config.enabled, config.ttl);
  }
}
