import { LLMConfig, LLMProvider, LLMResponse } from '../entities/llm-provider.entity';

export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface CompletionRequest {
  messages: Message[];
  config?: Partial<LLMConfig>;
  model?: string;
}

export interface StreamingCallbacks {
  onToken?: (token: string) => void;
  onComplete?: (response: LLMResponse) => void;
  onError?: (error: Error) => void;
}

export interface LLMService {
  /**
   * Get a completion from the LLM provider
   */
  complete(request: CompletionRequest): Promise<LLMResponse>;

  /**
   * Get a streaming completion from the LLM provider
   */
  completeStreaming(request: CompletionRequest, callbacks: StreamingCallbacks): Promise<void>;

  /**
   * Get the current provider configuration
   */
  getProvider(): LLMProvider;

  /**
   * Get available models from the provider
   */
  getAvailableModels(): Promise<string[]>;

  /**
   * Validate if the provider is properly configured and accessible
   */
  validateProvider(): Promise<boolean>;

  /**
   * Get the current rate limit status
   */
  getRateLimitStatus(): Promise<{
    remaining: number;
    reset: Date;
    limit: number;
  }>;

  /**
   * Calculate token count for a given text
   */
  countTokens(text: string): Promise<number>;

  /**
   * Calculate cost for a given request
   */
  calculateCost(tokens: number, model: string): number;
}

export class LLMServiceError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly provider: string,
    public readonly model?: string,
  ) {
    super(message);
    this.name = 'LLMServiceError';
  }
}

export class RateLimitError extends LLMServiceError {
  constructor(
    provider: string,
    public readonly resetDate: Date,
    model?: string,
  ) {
    super(
      `Rate limit exceeded for provider ${provider}. Reset at ${resetDate.toISOString()}`,
      'RATE_LIMIT_EXCEEDED',
      provider,
      model,
    );
    this.name = 'RateLimitError';
  }
}

export class TokenLimitError extends LLMServiceError {
  constructor(
    provider: string,
    public readonly tokenCount: number,
    public readonly maxTokens: number,
    model?: string,
  ) {
    super(
      `Token limit exceeded. Got ${tokenCount}, max is ${maxTokens}`,
      'TOKEN_LIMIT_EXCEEDED',
      provider,
      model,
    );
    this.name = 'TokenLimitError';
  }
}

export class InvalidRequestError extends LLMServiceError {
  constructor(
    provider: string,
    message: string,
    model?: string,
  ) {
    super(
      message,
      'INVALID_REQUEST',
      provider,
      model,
    );
    this.name = 'InvalidRequestError';
  }
}

export class ProviderError extends LLMServiceError {
  constructor(
    provider: string,
    message: string,
    model?: string,
  ) {
    super(
      message,
      'PROVIDER_ERROR',
      provider,
      model,
    );
    this.name = 'ProviderError';
  }
}

export class TimeoutError extends LLMServiceError {
  constructor(
    provider: string,
    public readonly timeout: number,
    model?: string,
  ) {
    super(
      `Request timed out after ${timeout}ms`,
      'TIMEOUT',
      provider,
      model,
    );
    this.name = 'TimeoutError';
  }
}
