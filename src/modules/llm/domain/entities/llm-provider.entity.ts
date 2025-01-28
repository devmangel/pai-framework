export enum LLMProviderType {
  OPENAI = 'OPENAI',
  ANTHROPIC = 'ANTHROPIC',
  CUSTOM = 'CUSTOM',
}

export interface LLMConfig {
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stop?: string[];
  timeout?: number;
}

export interface LLMResponse {
  content: string;
  tokens: {
    prompt: number;
    completion: number;
    total: number;
  };
  metadata: {
    model: string;
    provider: LLMProviderType;
    timestamp: Date;
    latency: number;
    cached?: boolean;
  };
}

export class LLMProvider {
  constructor(
    private readonly id: string,
    private readonly type: LLMProviderType,
    private readonly apiKey: string,
    private readonly defaultConfig: LLMConfig,
    private readonly models: string[],
    private readonly defaultModel: string,
    private readonly baseUrl?: string,
  ) {
    this.validateProvider();
  }

  private validateProvider(): void {
    if (!this.id || typeof this.id !== 'string') {
      throw new Error('Provider ID must be a non-empty string');
    }
    if (!Object.values(LLMProviderType).includes(this.type)) {
      throw new Error('Invalid provider type');
    }
    if (!this.apiKey || typeof this.apiKey !== 'string') {
      throw new Error('API key must be a non-empty string');
    }
    if (!this.models || !Array.isArray(this.models) || this.models.length === 0) {
      throw new Error('Provider must support at least one model');
    }
    if (!this.defaultModel || !this.models.includes(this.defaultModel)) {
      throw new Error('Default model must be one of the supported models');
    }
    if (this.type === LLMProviderType.CUSTOM && !this.baseUrl) {
      throw new Error('Custom providers must specify a base URL');
    }
  }

  public getId(): string {
    return this.id;
  }

  public getType(): LLMProviderType {
    return this.type;
  }

  public getModels(): string[] {
    return [...this.models];
  }

  public getDefaultModel(): string {
    return this.defaultModel;
  }

  public getDefaultConfig(): LLMConfig {
    return { ...this.defaultConfig };
  }

  public getBaseUrl(): string | undefined {
    return this.baseUrl;
  }

  public toJSON() {
    return {
      id: this.id,
      type: this.type,
      models: this.models,
      defaultModel: this.defaultModel,
      defaultConfig: this.defaultConfig,
      baseUrl: this.baseUrl,
    };
  }

  public static createOpenAI(apiKey: string, config?: Partial<LLMConfig>): LLMProvider {
    return new LLMProvider(
      'openai',
      LLMProviderType.OPENAI,
      apiKey,
      {
        maxTokens: 2048,
        temperature: 0.7,
        topP: 1,
        frequencyPenalty: 0,
        presencePenalty: 0,
        timeout: 30000,
        ...config,
      },
      ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo'],
      'gpt-4',
    );
  }

  public static createAnthropic(apiKey: string, config?: Partial<LLMConfig>): LLMProvider {
    return new LLMProvider(
      'anthropic',
      LLMProviderType.ANTHROPIC,
      apiKey,
      {
        maxTokens: 4096,
        temperature: 0.7,
        topP: 1,
        timeout: 30000,
        ...config,
      },
      ['claude-2', 'claude-instant'],
      'claude-2',
    );
  }

  public static createCustom(
    id: string,
    apiKey: string,
    baseUrl: string,
    models: string[],
    defaultModel: string,
    config?: Partial<LLMConfig>,
  ): LLMProvider {
    return new LLMProvider(
      id,
      LLMProviderType.CUSTOM,
      apiKey,
      {
        maxTokens: 2048,
        temperature: 0.7,
        topP: 1,
        timeout: 30000,
        ...config,
      },
      models,
      defaultModel,
      baseUrl,
    );
  }
}
