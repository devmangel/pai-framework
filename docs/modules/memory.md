# Módulo de Memoria

## Descripción General
El módulo de Memoria es un componente fundamental del framework AgentsAI que proporciona capacidades de almacenamiento y recuperación de información para los agentes. Implementa un sistema de memoria multicapa que permite a los agentes mantener contexto, aprender de experiencias pasadas y mejorar su toma de decisiones.

## Estructura del Módulo
```
src/modules/memory/
├── domain/
│   ├── entities/
│   │   └── memory-entry.entity.ts
│   ├── enums/
│   │   └── memory-type.enum.ts
│   ├── ports/
│   │   ├── memory.service.ts
│   │   └── memory.repository.ts
│   ├── config/
│   │   └── memory-config.ts
│   └── exceptions/
│       └── memory.exception.ts
├── infrastructure/
│   ├── repositories/
│   │   ├── chroma.repository.ts
│   │   └── sqlite.repository.ts
│   └── services/
│       └── embedding.service.ts
└── interface/
    └── http/
        └── memory.controller.ts
```

## Componentes Principales

### 1. Tipos de Memoria

El sistema implementa cuatro tipos principales de memoria:

#### Short-Term Memory
```typescript
interface ShortTermMemory {
  type: MemoryType.SHORT_TERM;
  storage: {
    type: MemoryStorageType.CHROMA;
    ragConfig: {
      chunkSize: number;
      overlapSize: number;
      similarityThreshold: number;
    };
  };
}
```
- Almacenamiento temporal basado en RAG
- Optimizado para contexto reciente
- Utiliza embeddings para búsqueda semántica

#### Long-Term Memory
```typescript
interface LongTermMemory {
  type: MemoryType.LONG_TERM;
  storage: {
    type: MemoryStorageType.SQLITE;
    pruningStrategy: 'age' | 'relevance' | 'hybrid';
  };
}
```
- Persistencia de información importante
- Estrategias de poda automática
- Backup y restauración

#### Entity Memory
```typescript
interface EntityMemory {
  type: MemoryType.ENTITY;
  storage: {
    type: MemoryStorageType.SQLITE;
    mergeStrategy: 'replace' | 'append' | 'smart';
  };
}
```
- Información sobre entidades específicas
- Actualización inteligente de información
- Resolución de conflictos

#### Contextual Memory
```typescript
interface ContextualMemory {
  type: MemoryType.CONTEXTUAL;
  maxContextSize: number;
  contextWindowSize: number;
}
```
- Combinación de otros tipos de memoria
- Gestión de ventana de contexto
- Priorización de información relevante

### 2. Entrada de Memoria (MemoryEntry)

La unidad básica de almacenamiento:

```typescript
interface MemoryEntry {
  id: string;
  content: string;
  metadata: {
    source?: string;
    timestamp: Date;
    context?: Record<string, any>;
    tags?: string[];
  };
  agentId?: string;
  embedding?: number[];
}
```

### 3. Sistema de Embeddings

Configuración de embeddings para búsqueda semántica:

```typescript
interface EmbeddingConfig {
  provider: EmbeddingProvider;
  model?: string;
  dimensions?: number;
  cache?: {
    enabled: boolean;
    ttl: number;
  };
}
```

## API REST

### Endpoints Principales

#### 1. Almacenar Memoria
```http
POST /memory
Content-Type: application/json

{
  "content": "Información a almacenar",
  "metadata": {
    "source": "conversation",
    "tags": ["importante", "cliente"]
  },
  "type": "SHORT_TERM",
  "agentId": "agent-123"
}
```

#### 2. Recuperar Memoria
```http
GET /memory/:id?type=SHORT_TERM
```

#### 3. Búsqueda Semántica
```http
POST /memory/search
Content-Type: application/json

{
  "content": "texto para buscar similares",
  "similarity": 0.8,
  "limit": 5
}
```

#### 4. Gestión de Memoria
```http
POST /memory/compress
DELETE /memory/clear
POST /memory/backup
POST /memory/restore
```

## Mejores Prácticas

### 1. Gestión de Memoria
```typescript
// Almacenar con contexto
await memoryService.store(
  "Información importante",
  {
    source: "conversación",
    context: { topic: "ventas" },
    tags: ["cliente", "importante"]
  },
  MemoryType.SHORT_TERM,
  agentId
);

// Búsqueda semántica
const similares = await memoryService.findSimilar(
  "consulta",
  MemoryType.SHORT_TERM,
  5
);
```

### 2. Optimización
```typescript
// Configuración de caché
memoryService.setCacheConfig({
  enabled: true,
  ttl: 3600,
  keyPrefix: 'agent-memory'
});

// Compresión de memoria
await memoryService.compressMemory(
  entries,
  targetSize
);
```

### 3. Manejo de Errores
```typescript
try {
  await memoryService.store(/* ... */);
} catch (error) {
  if (error instanceof MemoryException) {
    switch (error.code) {
      case 'STORAGE_ERROR':
        // Manejar error de almacenamiento
        break;
      case 'CAPACITY_ERROR':
        // Manejar error de capacidad
        break;
    }
  }
}
```

## Integración con Agentes

### 1. Acceso a Memoria
```typescript
class Agent {
  async recall(query: string): Promise<MemoryEntry[]> {
    return this.memoryService.search({
      content: query,
      type: MemoryType.SHORT_TERM,
      agentId: this.id
    });
  }

  async memorize(content: string, metadata: MemoryMetadata): Promise<void> {
    await this.memoryService.store(
      content,
      metadata,
      MemoryType.SHORT_TERM,
      this.id
    );
  }
}
```

### 2. Contexto en Tareas
```typescript
class Task {
  async execute(): Promise<void> {
    const context = await this.agent.recall(this.description);
    // Usar contexto en la ejecución
  }

  async complete(result: TaskResult): Promise<void> {
    await this.agent.memorize(
      result.content,
      { source: 'task', taskId: this.id }
    );
  }
}
```

## Conclusiones

El módulo de Memoria proporciona una base robusta para la gestión de información:

### Características Clave
- Sistema de memoria multicapa
- Búsqueda semántica eficiente
- Gestión automática de contexto
- Integración con agentes y tareas

### Puntos Fuertes
1. **Flexibilidad**
   - Múltiples tipos de memoria
   - Configuración personalizable
   - Estrategias de almacenamiento

2. **Rendimiento**
   - Sistema de caché
   - Compresión automática
   - Búsqueda optimizada

3. **Mantenibilidad**
   - Arquitectura modular
   - Manejo robusto de errores
   - Backup y restauración
