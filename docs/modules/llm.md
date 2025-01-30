# LLM Module

## Overview

The LLM (Large Language Model) module is responsible for managing interactions with large language model providers such as OpenAI. It includes functionalities for generating completions, streaming completions, managing cache, and handling provider configurations.

## Structure

The module is structured as follows:

- `llm.module.ts`: Defines the LLM module and its dependencies.
- `domain/`: Contains the domain layer, including entities and service interfaces.
  - `entities/llm-provider.entity.ts`: Defines the `LLMProvider` entity.
  - `ports/llm.service.ts`: Defines the `LLMService` interface and related errors.
- `infrastructure/`: Contains the infrastructure layer, including service implementations.
  - `services/openai.service.ts`: Implements the `LLMService` interface using OpenAI.
  - `services/cache.service.ts`: Provides caching functionalities for LLM responses.
- `interface/`: Contains the interface layer, including HTTP controllers and DTOs.
  - `http/llm.controller.ts`: Defines the `LLMController` for handling HTTP requests.
  - `http/dtos/completion.dto.ts`: Defines DTOs for completion requests and responses.

## Components

### LLM Module

The `LLMModule` is defined in `llm.module.ts` and includes the following components:

- `LLMController`: Handles HTTP requests related to LLM.
- `OpenAIService`: Implements the `LLMService` interface using OpenAI.
- `LLMCacheService`: Provides caching functionalities for LLM responses.
- `ConfigModule`: Provides configuration settings.
- `CacheModule`: Provides caching capabilities.

### Services

#### LLMService

The `LLMService` interface defines the following methods:

- `complete(request: CompletionRequest): Promise<LLMResponse>`
- `completeStreaming(request: CompletionRequest, callbacks: StreamingCallbacks): Promise<void>`
- `getProvider(): LLMProvider`
- `getAvailableModels(): Promise<string[]>`
- `validateProvider(): Promise<boolean>`
- `getRateLimitStatus(): Promise<{ remaining: number; reset: Date; limit: number }>`
- `countTokens(text: string): Promise<number>`
- `calculateCost(tokens: number, model: string): number`

#### OpenAIService

The `OpenAIService` class implements the `LLMService` interface and provides methods to interact with the OpenAI API.

#### LLMCacheService

The `LLMCacheService` class provides caching functionalities for LLM responses.

### Entities

#### LLMProvider

The `LLMProvider` entity represents a provider of large language models. It includes properties such as `id`, `type`, `apiKey`, `defaultConfig`, `models`, `defaultModel`, and `baseUrl`.

### Controllers

#### LLMController

The `LLMController` class handles HTTP requests related to LLM. It includes methods for generating completions, getting available models, getting provider status, counting tokens, and estimating costs.

### DTOs

#### CompletionRequestDto

The `CompletionRequestDto` class is used to validate and transfer the data needed to generate a completion. It includes properties such as `messages`, `config`, and `model`.

#### TokenCountResponseDto

The `TokenCountResponseDto` class is used to structure the response for token count requests. It includes a `count` property.

#### CostEstimateResponseDto

The `CostEstimateResponseDto` class is used to structure the response for cost estimate requests. It includes `cost` and `currency` properties.

#### ProviderStatusResponseDto

The `ProviderStatusResponseDto` class is used to structure the response for provider status requests. It includes `isValid`, `provider`, and `rateLimit` properties.
