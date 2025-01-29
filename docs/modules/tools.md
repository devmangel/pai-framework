# Módulo de Herramientas (Tools)

## Descripción General
El módulo de Herramientas es un componente central del framework AgentsAI que proporciona una infraestructura extensible para la creación, gestión y ejecución de herramientas que los agentes pueden utilizar. Inspirado en el sistema de herramientas de crewAI, este módulo permite a los agentes interactuar con diversos sistemas y realizar tareas específicas.

## Estructura del Módulo
```
src/modules/tools/
├── domain/
│   ├── entities/
│   │   └── tool.entity.ts
│   ├── enums/
│   │   └── tool-type.enum.ts
│   └── ports/
│       └── tool.repository.ts
├── infrastructure/
│   └── tools/
│       ├── base.tool.ts
│       └── file/
│           └── file-read.tool.ts
├── application/
│   ├── services/
│   │   └── tool.service.ts
│   └── dtos/
└── interface/
    └── http/
        ├── tools.controller.ts
        └── dtos/
```

## Componentes Principales

### 1. Herramienta Base (BaseTool)

La clase abstracta que define la estructura base para todas las herramientas:

#### Configuración
```typescript
interface CacheConfig {
  enabled: boolean;
  ttl: number;
  keyPrefix?: string;
}

interface ToolContext {
  agentId?: string;
  teamId?: string;
  taskId?: string;
  metadata?: Record<string, any>;
}
```

#### Métodos Principales
```typescript
abstract class BaseTool {
  // Método principal para ejecutar la herramienta
  protected abstract execute(
    args: Record<string, any>,
    context?: ToolContext
  ): Promise<ToolResult>;

  // Método público con caché y manejo de errores
  public async run(
    args: Record<string, any>,
    context?: ToolContext
  ): Promise<ToolResult>;

  // Configuración de caché
  public setCacheConfig(config: Partial<CacheConfig>): void;
  public enableCache(): void;
  public disableCache(): void;
}
```

### 2. Tipos de Herramientas

#### Tipos Disponibles
```typescript
enum ToolType {
  FILE = 'FILE',
  WEB = 'WEB',
  LLM = 'LLM',
  DATABASE = 'DATABASE',
  API = 'API',
  CUSTOM = 'CUSTOM'
}
```

#### Categorías
```typescript
enum ToolCategory {
  READ = 'READ',
  WRITE = 'WRITE',
  SEARCH = 'SEARCH',
  PROCESS = 'PROCESS',
  ANALYZE = 'ANALYZE',
  GENERATE = 'GENERATE'
}
```

### 3. Entidad Herramienta (Tool)

La entidad que representa una herramienta en el sistema:

```typescript
interface ToolArgument {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description: string;
  required: boolean;
  default?: any;
}

interface ToolMetadata {
  version: string;
  author?: string;
  license?: string;
  tags?: string[];
  documentation?: string;
}

class Tool {
  // Propiedades principales
  id: string;
  name: string;
  description: string;
  type: ToolType;
  category: ToolCategory;
  arguments: ToolArgument[];
  metadata: ToolMetadata;
}
```

## API REST

### Endpoints Principales

#### 1. Listar Herramientas
```http
GET /tools
```

#### 2. Filtrar por Tipo
```http
GET /tools/type/:type
```

#### 3. Filtrar por Categoría
```http
GET /tools/category/:category
```

#### 4. Ejecutar Herramienta
```http
POST /tools/execute
Content-Type: application/json

{
  "id": "file-read",
  "args": {
    "path": "/ruta/al/archivo",
    "encoding": "utf-8"
  },
  "context": {
    "agentId": "agent-1",
    "taskId": "task-1"
  }
}
```

#### 5. Ejecución en Lote
```http
POST /tools/execute/batch
Content-Type: application/json

{
  "executions": [
    {
      "id": "file-read",
      "args": {
        "path": "/ruta/archivo1"
      }
    },
    {
      "id": "file-read",
      "args": {
        "path": "/ruta/archivo2"
      }
    }
  ]
}
```

## Implementación de Herramientas

### 1. Herramienta de Lectura de Archivos
```typescript
@Injectable()
export class FileReadTool extends BaseTool {
  constructor(cacheManager: Cache) {
    super(
      cacheManager,
      'file-read',
      'File Read Tool',
      'Reads file content',
      ToolType.FILE,
      ToolCategory.READ,
      [
        {
          name: 'path',
          type: 'string',
          description: 'File path',
          required: true
        }
      ],
      'readFile',
      { version: '1.0.0' }
    );
  }

  protected async execute(
    args: Record<string, any>,
    context?: ToolContext
  ): Promise<ToolResult> {
    // Implementación específica
  }
}
```

## Mejores Prácticas

### 1. Creación de Herramientas
```typescript
// Extender BaseTool
export class CustomTool extends BaseTool {
  constructor() {
    super(
      // Configuración básica
      id, name, description,
      // Tipo y categoría
      type, category,
      // Argumentos
      arguments,
      // Metadata
      metadata
    );
  }

  protected async execute(args, context) {
    // Implementación específica
  }
}
```

### 2. Gestión de Caché
```typescript
// Configurar caché por herramienta
tool.setCacheConfig({
  enabled: true,
  ttl: 300, // 5 minutos
  keyPrefix: 'custom-tool'
});

// Verificar caché antes de ejecutar
const cacheKey = generateCacheKey(args);
const cached = await getCachedResult(cacheKey);
if (cached) return cached;
```

### 3. Manejo de Errores
```typescript
try {
  // Validar argumentos
  validateArguments(args);
  
  // Ejecutar herramienta
  const result = await execute(args);
  
  return {
    success: true,
    data: result
  };
} catch (error) {
  return {
    success: false,
    error: error.message
  };
}
```

### 4. Contexto de Ejecución
```typescript
// Proporcionar contexto
const result = await tool.run(
  args,
  {
    agentId: 'agent-1',
    taskId: 'task-1',
    metadata: {
      priority: 'high'
    }
  }
);
```

## Conclusiones

El módulo de Herramientas proporciona una base sólida para la extensibilidad del sistema:

### Características Clave
- Sistema de herramientas extensible
- Caché integrado
- Manejo de errores robusto
- API REST completa

### Puntos Fuertes
1. **Flexibilidad**
   - Arquitectura extensible
   - Tipos personalizables
   - Sistema de plugins

2. **Rendimiento**
   - Caché configurable
   - Ejecución en lote
   - Validación de argumentos

3. **Integración**
   - API REST completa
   - Contexto de ejecución
   - Metadata extensible

### Extensibilidad
El módulo está diseñado para facilitar la adición de nuevas herramientas:
1. Crear nueva clase extendiendo BaseTool
2. Implementar lógica específica
3. Registrar en el módulo
4. Disponible automáticamente vía API
