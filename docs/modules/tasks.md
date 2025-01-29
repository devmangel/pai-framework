# Módulo de Tareas

## Descripción General
El módulo de Tareas es un componente esencial del framework AgentsAI que gestiona la creación, asignación y seguimiento de tareas para los agentes. Proporciona una estructura robusta para la gestión del ciclo de vida de las tareas, incluyendo dependencias, prioridades y resultados.

## Estructura del Módulo
```
src/modules/tasks/
├── domain/
│   ├── entities/
│   │   └── task.entity.ts
│   ├── enums/
│   │   ├── task-priority.enum.ts
│   │   └── task-status.enum.ts
│   ├── exceptions/
│   │   └── task.exceptions.ts
│   ├── ports/
│   │   ├── task.repository.ts
│   │   └── task.service.ts
│   └── value-objects/
│       └── task-result.vo.ts
├── infrastructure/
│   ├── repositories/
│   │   └── dynamodb-task.repository.ts
│   └── services/
│       └── task.service.ts
└── interface/
    └── http/
        ├── tasks.controller.ts
        ├── dtos/
        │   ├── create-task.dto.ts
        │   └── update-task.dto.ts
        └── filters/
            └── task-exception.filter.ts
```

## Componentes Principales

### 1. Entidad Tarea (Task)

La entidad principal que representa una tarea en el sistema:

#### Propiedades
```typescript
class Task {
  constructor(
    id: string,
    title: string,
    description: string,
    status: TaskStatus,
    priority: TaskPriority,
    assignedTo?: Agent,
    result?: TaskResult,
    createdAt: Date,
    updatedAt: Date,
    completedAt?: Date,
    parentId?: string,
    dependencies: string[],
    metadata: Record<string, any>
  )
}
```

#### Estados de Tarea
```typescript
enum TaskStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  BLOCKED = 'BLOCKED',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED'
}
```

#### Niveles de Prioridad
```typescript
enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}
```

#### Métodos Principales
```typescript
// Getters
getId(): string
getTitle(): string
getDescription(): string
getStatus(): TaskStatus
getPriority(): TaskPriority
getAssignedAgent(): Agent | undefined
getResult(): TaskResult | undefined

// Setters
updateTitle(title: string): void
updateDescription(description: string): void
updateStatus(status: TaskStatus): void
updatePriority(priority: TaskPriority): void
assignTo(agent: Agent): void
unassign(): void
setResult(result: TaskResult): void

// Estado
isAssigned(): boolean
isCompleted(): boolean
isInProgress(): boolean
hasResult(): boolean
hasDependencies(): boolean
isBlocked(): boolean
isHighPriority(): boolean
```

### 2. Resultado de Tarea (TaskResult)

Value Object que representa el resultado de una tarea:

```typescript
class TaskResult {
  constructor(
    content: string,
    success: boolean,
    error?: string,
    metadata?: Record<string, any>,
    timestamp?: Date
  )

  // Métodos Factory
  static createSuccess(
    content: string,
    metadata?: Record<string, any>
  ): TaskResult

  static createError(
    error: string,
    metadata?: Record<string, any>
  ): TaskResult
}
```

### 3. Servicio de Tareas

Interface que define las operaciones disponibles:

#### Operaciones Principales
```typescript
interface TaskService {
  // Operaciones básicas
  createTask(dto: CreateTaskDto): Promise<Task>
  getTaskById(id: string): Promise<Task>
  updateTask(id: string, dto: UpdateTaskDto): Promise<Task>
  deleteTask(id: string): Promise<void>
  
  // Gestión del ciclo de vida
  startTask(id: string, agent: Agent): Promise<Task>
  completeTask(id: string, result: TaskResult): Promise<Task>
  failTask(id: string, error: string): Promise<Task>
  cancelTask(id: string, reason: string): Promise<Task>
  blockTask(id: string, reason: string): Promise<Task>
  unblockTask(id: string): Promise<Task>
  
  // Gestión de asignaciones
  assignTask(id: string, agent: Agent): Promise<Task>
  unassignTask(id: string): Promise<Task>
  reassignTask(id: string, newAgent: Agent): Promise<Task>
}
```

#### Consultas y Filtros
```typescript
interface TaskService {
  getTasks(filters?: {
    status?: TaskStatus
    priority?: TaskPriority
    agentId?: string
    parentId?: string
  }): Promise<Task[]>
  
  getTasksByStatus(status: TaskStatus): Promise<Task[]>
  getTasksByPriority(priority: TaskPriority): Promise<Task[]>
  getTasksByAgent(agentId: string): Promise<Task[]>
  getBlockedTasks(): Promise<Task[]>
  getOverdueTasks(): Promise<Task[]>
}
```

### 4. Gestión de Dependencias

Funcionalidades para manejar relaciones entre tareas:

```typescript
interface TaskService {
  // Gestión de dependencias
  addTaskDependency(taskId: string, dependencyId: string): Promise<void>
  removeTaskDependency(taskId: string, dependencyId: string): Promise<void>
  getTaskDependencies(taskId: string): Promise<Task[]>
  getTaskDependents(taskId: string): Promise<Task[]>
  checkDependenciesMet(taskId: string): Promise<boolean>
}
```

## API REST

### Endpoints Principales

#### 1. Crear Tarea
```http
POST /tasks
Content-Type: application/json

{
  "title": "Analizar datos de mercado",
  "description": "Realizar análisis de tendencias",
  "priority": "HIGH",
  "dependencies": ["task-id-1", "task-id-2"],
  "metadata": {
    "domain": "finanzas",
    "requiredTools": ["análisis-estadístico"]
  }
}
```

#### 2. Actualizar Tarea
```http
PUT /tasks/:id
Content-Type: application/json

{
  "title": "Nuevo título",
  "priority": "CRITICAL",
  "metadata": {
    "urgente": true
  }
}
```

#### 3. Gestionar Estado
```http
POST /tasks/:id/start
POST /tasks/:id/complete
POST /tasks/:id/fail
POST /tasks/:id/cancel
POST /tasks/:id/block
POST /tasks/:id/unblock
```

#### 4. Gestionar Asignaciones
```http
POST /tasks/:id/assign
POST /tasks/:id/unassign
POST /tasks/:id/reassign
```

## Mejores Prácticas

### 1. Creación de Tareas
```typescript
// Crear tarea con dependencias
const task = await taskService.createTask({
  title: "Análisis de Datos",
  description: "Procesar datos de ventas Q4",
  priority: TaskPriority.HIGH,
  dependencies: ["task-1", "task-2"],
  metadata: {
    dataSource: "ventas_q4.csv",
    requiredMemory: "4GB"
  }
});
```

### 2. Gestión de Estados
```typescript
// Flujo de trabajo típico
await taskService.startTask(taskId, agent);
try {
  const result = await processTask(taskId);
  await taskService.completeTask(taskId, TaskResult.createSuccess(result));
} catch (error) {
  await taskService.failTask(taskId, error.message);
}
```

### 3. Manejo de Dependencias
```typescript
// Verificar dependencias antes de iniciar
const { can, reason } = await taskService.canStart(taskId);
if (!can) {
  await taskService.blockTask(taskId, reason);
  return;
}

// Iniciar tarea
await taskService.startTask(taskId, agent);
```

### 4. Monitoreo y Estadísticas
```typescript
// Obtener estadísticas
const stats = await taskService.getTaskStatistics();
console.log('Tareas por estado:', stats.byStatus);
console.log('Tareas por prioridad:', stats.byPriority);
console.log('Tareas por agente:', stats.byAgent);
```

## Conclusiones

El módulo de Tareas proporciona una base sólida para la gestión de tareas con:

### Características Clave
- Gestión completa del ciclo de vida
- Sistema de dependencias flexible
- Priorización y asignación de recursos
- Seguimiento detallado de estados

### Puntos Fuertes
1. **Flexibilidad**
   - Múltiples estados y prioridades
   - Metadatos personalizables
   - Sistema de dependencias robusto

2. **Trazabilidad**
   - Registro completo de cambios
   - Resultados detallados
   - Estadísticas y análisis

3. **Integración**
   - Conexión con módulo de Agentes
   - API REST completa
   - Eventos y notificaciones
