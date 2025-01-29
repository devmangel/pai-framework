# Módulo LLM (Language Learning Models)

## Descripción General
El módulo LLM es un componente fundamental del framework AgentsAI que gestiona la interacción con diferentes proveedores de modelos de lenguaje. Proporciona una capa de abstracción unificada para realizar completaciones de texto, gestionar tokens, caché y límites de tasa, permitiendo una integración fluida con diversos proveedores de LLM.

## Estructura del Módulo
```
src/modules/llm/
├── domain/
│   ├── entities/
│   │   └── llm-provider.entity.ts
│   └── ports/
│       └── llm.service.ts
├── infrastructure/
│   └── services/
│       ├── cache.service.ts
│       └── openai.service.ts
└── interface/
    └── http/
        ├── llm.controller.ts
        ├── filters/
        │   └── llm-exception.filter.ts
        └── dtos/
            └── completion.dto.ts
```

## Componentes Principales

### 1. Proveedor LLM (LLMProvider)

La entidad principal que representa un proveedor de servicios LLM:

#### Tipos de Proveedores
```typescript
enum LLMProviderType {
  OPENAI = 'OPENAI',
  ANTHROPIC = 'ANTHROPIC',
  CUSTOM = 'CUSTOM'
}
```

#### Configuración
```typescript
interface LLMConfig {
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stop?: string[];
  timeout?: number;
}
```

#### Métodos Factory
```typescript
// Crear proveedor OpenAI
static createOpenAI(apiKey: string, config?: Partial<LLMConfig>)

// Crear proveedor Anthropic
static createAnthropic(apiKey: string, config?: Partial<LLMConfig>)

// Crear proveedor personalizado
static createCustom(
  id: string,
  apiKey: string,
  baseUrl: string,
  models: string[],
  defaultModel: string,
  config?: Partial<LLMConfig>
)
```

### 2. Servicio LLM

Interface principal que define las operaciones disponibles:

#### Operaciones Principales
```typescript
interface LLMService {
  // Completación de texto
  complete(request: CompletionRequest): Promise<LLMResponse>;
  
  // Completación streaming
  completeStreaming(
    request: CompletionRequest, 
    callbacks: StreamingCallbacks
  ): Promise<void>;
  
  // Gestión de proveedores
  getProvider(): LLMProvider;
  getAvailableModels(): Promise<string[]>;
  validateProvider(): Promise<boolean>;
  
  // Utilidades
  getRateLimitStatus(): Promise<{
    remaining: number;
    reset: Date;
    limit: number;
  }>;
  countTokens(text: string): Promise<number>;
  calculateCost(tokens: number, model: string): number;
}
```

#### Tipos de Mensajes
```typescript
interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface CompletionRequest {
  messages: Message[];
  config?: Partial<LLMConfig>;
  model?: string;
}
```

### 3. Sistema de Caché

Implementación de caché para optimizar respuestas:

#### Funcionalidades
```typescript
class LLMCacheService {
  // Obtener respuesta cacheada
  getCachedResponse(prompt: string, model: string): Promise<string | null>;
  
  // Almacenar respuesta en caché
  cacheResponse(prompt: string, model: string, response: string): Promise<void>;
  
  // Invalidar caché
  invalidateCache(prompt: string, model: string): Promise<void>;
}
```

### 4. Manejo de Errores

Jerarquía de errores específicos del módulo:

```typescript
// Error base
class LLMServiceError extends Error {
  code: string;
  provider: string;
  model?: string;
}

// Errores específicos
class RateLimitError extends LLMServiceError
class TokenLimitError extends LLMServiceError
class InvalidRequestError extends LLMServiceError
class ProviderError extends LLMServiceError
class TimeoutError extends LLMServiceError
```

## API REST

### Endpoints Disponibles

#### 1. Completación de Texto
```http
POST /llm/complete
Content-Type: application/json

{
  "messages": [
    {
      "role": "user",
      "content": "¿Cuál es la capital de Francia?"
    }
  ],
  "config": {
    "temperature": 0.7,
    "maxTokens": 100
  },
  "model": "gpt-4"
}
```

#### 2. Obtener Modelos Disponibles
```http
GET /llm/models
```

#### 3. Estado del Proveedor
```http
GET /llm/provider/status
```

#### 4. Conteo de Tokens
```http
GET /llm/tokens/count?text=texto_a_contar
```

#### 5. Estimación de Costos
```http
GET /llm/cost/estimate?tokens=1000&model=gpt-4
```

## Mejores Prácticas

### 1. Configuración de Proveedores
- Utilizar valores de configuración apropiados según el caso de uso
- Implementar fallbacks entre proveedores
- Mantener las claves API seguras

```typescript
const provider = LLMProvider.createOpenAI(apiKey, {
  temperature: 0.7,
  maxTokens: 2048,
  timeout: 30000
});
```

### 2. Gestión de Caché
- Utilizar caché para respuestas frecuentes
- Implementar TTL apropiado
- Invalidar caché cuando sea necesario

```typescript
// Verificar caché antes de llamar al API
const cachedResponse = await cacheService.getCachedResponse(prompt, model);
if (cachedResponse) {
  return cachedResponse;
}
```

### 3. Control de Costos
- Monitorear uso de tokens
- Implementar límites de presupuesto
- Utilizar modelos apropiados según necesidad

```typescript
// Estimar costo antes de procesar
const tokenCount = await llmService.countTokens(text);
const cost = llmService.calculateCost(tokenCount, model);
if (cost > maxBudget) {
  throw new Error('Excede presupuesto máximo');
}
```

### 4. Manejo de Errores
- Implementar reintentos con backoff
- Manejar límites de tasa
- Logging apropiado

```typescript
try {
  const response = await llmService.complete(request);
} catch (error) {
  if (error instanceof RateLimitError) {
    // Esperar y reintentar
    await delay(error.resetDate.getTime() - Date.now());
    return await llmService.complete(request);
  }
  // Manejar otros errores
}
```

## Conclusiones

El módulo LLM proporciona una base robusta para la integración con modelos de lenguaje:

### Características Clave
- Abstracción unificada de proveedores
- Sistema de caché eficiente
- Gestión de costos y límites
- API REST completa

### Puntos Fuertes
1. **Flexibilidad**
   - Soporte multi-proveedor
   - Configuración personalizable
   - Extensible para nuevos proveedores

2. **Rendimiento**
   - Sistema de caché integrado
   - Streaming de respuestas
   - Control de límites de tasa

3. **Mantenibilidad**
   - Arquitectura limpia
   - Errores tipados
   - Documentación completa
