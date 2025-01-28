import { Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';
import { ConfigService } from '../../../../config/config.service';
import { LLMCacheService } from './cache.service';
import {
  LLMService,
  Message,
  CompletionRequest,
  StreamingCallbacks,
  RateLimitError,
  TokenLimitError,
  InvalidRequestError,
  ProviderError,
  TimeoutError,
} from '../../domain/ports/llm.service';
import {
  LLMProvider,
  LLMProviderType,
  LLMResponse,
} from '../../domain/entities/llm-provider.entity';

@Injectable()
export class OpenAIService implements LLMService {
  private readonly provider: LLMProvider;
  private readonly client: OpenAI;
  private rateLimitInfo = {
    remaining: 1000,
    reset: new Date(Date.now() + 60000),
    limit: 1000,
  };

  constructor(
    private readonly configService: ConfigService,
    private readonly cacheService: LLMCacheService,
  ) {
    const apiKey = this.configService.llmConfig.openaiApiKey;
    if (!apiKey) {
      throw new Error('OpenAI API key is not configured');
    }

    this.provider = LLMProvider.createOpenAI(apiKey);
    this.client = new OpenAI({ apiKey });
  }

  async complete(request: CompletionRequest): Promise<LLMResponse> {
    const startTime = Date.now();
    try {
      const model = request.model || this.provider.getDefaultModel();
      
      // Check cache first
      const prompt = request.messages.map(m => `${m.role}: ${m.content}`).join('\n');
      const cachedResponse = await this.cacheService.getCachedResponse(prompt, model);
      
      if (cachedResponse) {
        return {
          content: cachedResponse,
          tokens: {
            prompt: await this.countTokens(prompt),
            completion: await this.countTokens(cachedResponse),
            total: await this.countTokens(prompt + cachedResponse),
          },
          metadata: {
            model,
            provider: LLMProviderType.OPENAI,
            timestamp: new Date(),
            latency: Date.now() - startTime,
            cached: true,
          },
        };
      }
      const config = {
        ...this.provider.getDefaultConfig(),
        ...request.config,
      };

      const response = await this.client.chat.completions.create({
        model,
        messages: request.messages.map(msg => ({
          role: msg.role,
          content: msg.content,
        })),
        max_tokens: config.maxTokens,
        temperature: config.temperature,
        top_p: config.topP,
        frequency_penalty: config.frequencyPenalty,
        presence_penalty: config.presencePenalty,
        stop: config.stop,
      });

      // Rate limits are now handled by the OpenAI client internally

      const result = {
        content: response.choices[0].message.content || '',
        tokens: {
          prompt: response.usage?.prompt_tokens || 0,
          completion: response.usage?.completion_tokens || 0,
          total: response.usage?.total_tokens || 0,
        },
        metadata: {
          model: response.model,
          provider: LLMProviderType.OPENAI,
          timestamp: new Date(),
          latency: Date.now() - startTime,
          cached: false,
        },
      };

      // Cache the response
      await this.cacheService.cacheResponse(prompt, model, result.content);

      return result;
    } catch (error) {
      this.handleError(error, startTime);
    }
  }

  async completeStreaming(
    request: CompletionRequest,
    callbacks: StreamingCallbacks,
  ): Promise<void> {
    const startTime = Date.now();
    try {
      const model = request.model || this.provider.getDefaultModel();
      const config = {
        ...this.provider.getDefaultConfig(),
        ...request.config,
      };

      const stream = await this.client.chat.completions.create({
        model,
        messages: request.messages.map(msg => ({
          role: msg.role,
          content: msg.content,
        })),
        max_tokens: config.maxTokens,
        temperature: config.temperature,
        top_p: config.topP,
        frequency_penalty: config.frequencyPenalty,
        presence_penalty: config.presencePenalty,
        stop: config.stop,
        stream: true,
      });

      let content = '';
      let totalTokens = 0;

      for await (const chunk of stream) {
        const token = chunk.choices[0]?.delta?.content || '';
        content += token;
        totalTokens += 1;

        if (callbacks.onToken) {
          callbacks.onToken(token);
        }
      }

      if (callbacks.onComplete) {
        callbacks.onComplete({
          content,
          tokens: {
            prompt: 0, // Not available in streaming mode
            completion: totalTokens,
            total: totalTokens,
          },
          metadata: {
            model,
            provider: LLMProviderType.OPENAI,
            timestamp: new Date(),
            latency: Date.now() - startTime,
          },
        });
      }
    } catch (error) {
      if (callbacks.onError) {
        callbacks.onError(this.handleError(error, startTime));
      }
    }
  }

  getProvider(): LLMProvider {
    return this.provider;
  }

  async getAvailableModels(): Promise<string[]> {
    try {
      const response = await this.client.models.list();
      return response.data
        .filter(model => 
          model.id.startsWith('gpt-') && 
          !model.id.includes('instruct')
        )
        .map(model => model.id);
    } catch (error) {
      throw new ProviderError(
        this.provider.getId(),
        'Failed to fetch available models'
      );
    }
  }

  async validateProvider(): Promise<boolean> {
    try {
      await this.client.models.list();
      return true;
    } catch {
      return false;
    }
  }

  getRateLimitStatus(): Promise<{
    remaining: number;
    reset: Date;
    limit: number;
  }> {
    return Promise.resolve(this.rateLimitInfo);
  }

  async countTokens(text: string): Promise<number> {
    // This is a rough estimation. For production, use a proper tokenizer
    return Math.ceil(text.length / 4);
  }

  calculateCost(tokens: number, model: string): number {
    // Cost per 1K tokens (as of 2024)
    const costs: Record<string, { input: number; output: number }> = {
      'gpt-4': { input: 0.03, output: 0.06 },
      'gpt-4-turbo': { input: 0.01, output: 0.03 },
      'gpt-3.5-turbo': { input: 0.001, output: 0.002 },
    };

    const modelCost = costs[model] || costs['gpt-3.5-turbo'];
    // Assuming an even split between input and output tokens
    const inputTokens = Math.floor(tokens / 2);
    const outputTokens = tokens - inputTokens;

    return (
      (inputTokens * modelCost.input + outputTokens * modelCost.output) / 1000
    );
  }

  private updateRateLimitInfo() {
    // Using default values since OpenAI now handles rate limiting internally
    this.rateLimitInfo = {
      remaining: 1000,
      reset: new Date(Date.now() + 60000),
      limit: 1000,
    };
  }

  private handleError(error: any, startTime: number): never {
    const elapsed = Date.now() - startTime;

    if (error.status === 429) {
      throw new RateLimitError(
        this.provider.getId(),
        new Date(Date.now() + 60000)
      );
    }

    if (error.status === 400) {
      if (error.message.includes('token')) {
        throw new TokenLimitError(
          this.provider.getId(),
          error.tokenCount || 0,
          error.maxTokens || 0
        );
      }
      throw new InvalidRequestError(this.provider.getId(), error.message);
    }

    if (elapsed >= (this.provider.getDefaultConfig().timeout || 30000)) {
      throw new TimeoutError(
        this.provider.getId(),
        this.provider.getDefaultConfig().timeout || 30000
      );
    }

    throw new ProviderError(
      this.provider.getId(),
      error.message || 'Unknown error occurred'
    );
  }
}
