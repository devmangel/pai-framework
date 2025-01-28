import { 
  Controller, 
  Post, 
  Get, 
  Body, 
  Inject, 
  Query, 
  UseFilters,
  ParseIntPipe,
  ValidationPipe,
  UsePipes,
} from '@nestjs/common';
import { LLMService } from '../../domain/ports/llm.service';
import { LLMResponse } from '../../domain/entities/llm-provider.entity';
import { LLMExceptionFilter } from './filters/llm-exception.filter';
import {
  CompletionRequestDto,
  TokenCountResponseDto,
  CostEstimateResponseDto,
  ProviderStatusResponseDto,
} from './dtos/completion.dto';

@Controller('llm')
@UseFilters(LLMExceptionFilter)
@UsePipes(new ValidationPipe({ transform: true }))
export class LLMController {
  constructor(
    @Inject('LLMService')
    private readonly llmService: LLMService,
  ) {}

  @Post('complete')
  async complete(
    @Body() request: CompletionRequestDto
  ): Promise<LLMResponse> {
    return await this.llmService.complete(request);
  }

  @Get('models')
  async getModels(): Promise<string[]> {
    return await this.llmService.getAvailableModels();
  }

  @Get('provider/status')
  async getProviderStatus(): Promise<ProviderStatusResponseDto> {
    const [isValid, rateLimit] = await Promise.all([
      this.llmService.validateProvider(),
      this.llmService.getRateLimitStatus(),
    ]);

    return {
      isValid,
      provider: this.llmService.getProvider().getId(),
      rateLimit,
    };
  }

  @Get('tokens/count')
  async countTokens(
    @Query('text') text: string
  ): Promise<TokenCountResponseDto> {
    const count = await this.llmService.countTokens(text);
    return { count };
  }

  @Get('cost/estimate')
  async estimateCost(
    @Query('tokens', ParseIntPipe) tokens: number,
    @Query('model') model: string,
  ): Promise<CostEstimateResponseDto> {
    const cost = this.llmService.calculateCost(tokens, model);
    return {
      cost,
      currency: 'USD',
    };
  }
}
