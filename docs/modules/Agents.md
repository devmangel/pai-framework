# Módulo de Agentes

## Descripción General
El módulo de Agentes es un componente central del framework AgentsAI que gestiona agentes de IA autónomos. Cada agente es una entidad independiente con roles específicos, capacidades y objetivos, diseñado para trabajar de forma individual o como parte de un equipo.

## Estructura del Módulo
```
src/modules/agents/
├── domain/
│   ├── entities/
│   │   └── agent.entity.ts
│   ├── value-objects/
│   │   ├── agent-role.vo.ts
│   │   ├── agent-capability.vo.ts
│   │   └── agent-id.vo.ts
│   └── ports/
│       └── agent.repository.ts
├── application/
│   ├── use-cases/
│   │   └── create-agent.use-case.ts
│   └── dtos/
├── infrastructure/
│   └── persistence/
│       └── dynamodb/
└── interface/
    └── http/
```

## Componentes Principales

### 1. Entidad Agente (Agent)

La entidad principal del módulo con las siguientes características:

#### Propiedades
- `id`: Identificador único
- `name`: Nombre del agente
- `role`: Rol asignado
- `capabilities`: Capacidades
- `description`: Descripción
- `goals`: Objetivos
- `memory`: Estado persistente

#### Métodos Principales
```typescript
// Creación
static create(name, role, capabilities, description, goals)

// Actualización
updateName(name)
updateRole(role)
updateDescription(description)
updateGoals(goals)
updateMemory(key, value)

// Gestión de Capacidades
addCapability(capability)
removeCapability(capability)
```

### 2. Roles de Agente

#### Tipos de Roles
1. **Coordinador**
   - Gestión de actividades del equipo
   - Distribución de tareas
   - Monitoreo de progreso
   - Optimización de rendimiento

2. **Investigador**
   - Recopilación de información
   - Análisis de datos
   - Generación de informes
   - Identificación de patrones

3. **Ejecutor**
   - Implementación de soluciones
   - Seguimiento de procedimientos
   - Reporte de resultados
   - Manejo de herramientas

4. **Validador**
   - Revisión de resultados
   - Control de calidad
   - Retroalimentación
   - Documentación

### 3. Capacidades

#### Tipos de Capacidades
```typescript
enum CapabilityType {
  TOOL,           // Herramientas
  SKILL,          // Habilidades
  INTEGRATION,    // Integraciones
  COMMUNICATION   // Comunicación
}
```

#### Capacidades Predefinidas

1. **Búsqueda Web**
   - Búsqueda de información
   - Parámetros: query, maxResults
   - Tipo: TOOL

2. **Operaciones de Archivo**
   - Lectura/escritura de archivos
   - Parámetros: path, operation, content
   - Tipo: TOOL

3. **Integración API**
   - Interacción con APIs externas
   - Parámetros: endpoint, method, body
   - Tipo: INTEGRATION

4. **Comunicación de Equipo**
   - Mensajería entre agentes
   - Parámetros: recipient, message, priority
   - Tipo: COMMUNICATION

## Uso del Módulo

### Crear un Agente
```typescript
const agent = Agent.create(
  "Asistente de Investigación",
  AgentRole.RESEARCHER,
  [CommonCapabilities.WEB_SEARCH],
  "Agente especializado en investigación",
  ["Recopilar información precisa", "Generar análisis detallados"]
);
```

### Gestionar Capacidades
```typescript
// Añadir capacidad
agent.addCapability(CommonCapabilities.FILE_OPERATION);

// Remover capacidad
agent.removeCapability(CommonCapabilities.WEB_SEARCH);
```

### Actualizar Estado
```typescript
// Actualizar objetivos
agent.updateGoals(["Nuevo objetivo 1", "Nuevo objetivo 2"]);

// Gestionar memoria
agent.updateMemory("lastSearch", "resultado búsqueda");
```

## Mejores Prácticas

1. **Creación de Agentes**
   - Usar siempre el método factory `create()`
   - Definir roles y capacidades claramente
   - Establecer objetivos específicos

2. **Gestión de Estado**
   - Mantener la memoria actualizada
   - Usar getters para acceso seguro
   - Actualizar timestamps apropiadamente

3. **Validación**
   - Validar inputs en setters
   - Verificar tipos de capacidades
   - Asegurar consistencia de datos

4. **Extensibilidad**
   - Crear roles personalizados según necesidad
   - Implementar nuevas capacidades
   - Mantener la inmutabilidad

## Capa de Aplicación

### Casos de Uso

#### CreateAgentUseCase
Este caso de uso maneja la creación de nuevos agentes en el sistema.

```typescript
interface CreateAgentDto {
  name: string;
  role: {
    name: string;
    description: string;
    responsibilities: string[];
  };
  capabilities: Array<{
    name: string;
    description: string;
    type: CapabilityType;
    parameters: Array<{
      name: string;
      type: ParameterType;
      description?: string;
      required: boolean;
      defaultValue?: any;
    }>;
  }>;
  description: string;
  goals: string[];
}
```

Proceso de creación:
1. Validación de datos de entrada
2. Verificación de duplicados
3. Creación de objetos de valor (Role, Capabilities)
4. Persistencia del nuevo agente

### Servicios de Aplicación

Los servicios de aplicación coordinan las operaciones entre la capa de dominio y la infraestructura:

1. **Validación**
   - Verificación de nombres duplicados
   - Validación de roles y capacidades
   - Comprobación de consistencia de datos

2. **Transformación de Datos**
   - Conversión entre DTOs y entidades
   - Mapeo de datos para la persistencia
   - Formateo de respuestas

3. **Coordinación**
   - Gestión de transacciones
   - Manejo de eventos del dominio
   - Orquestación de operaciones complejas

### Flujo de Datos
```
DTO de Entrada -> Validación -> Transformación -> 
Lógica de Dominio -> Persistencia -> DTO de Salida
```

## Persistencia

El módulo utiliza DynamoDB como almacenamiento principal, pero está diseñado para ser independiente de la implementación específica:

### Interfaz del Repositorio
```typescript
interface AgentRepository {
  save(agent: Agent): Promise<void>;
  findById(id: string): Promise<Agent | null>;
  findByName(name: string): Promise<Agent[]>;
  delete(id: string): Promise<void>;
  exists(id: string): Promise<boolean>;
}
```

### Implementación DynamoDB
- Mapeo entre entidades y estructura de DynamoDB
- Gestión de índices para búsquedas eficientes
- Manejo de consistencia eventual
- Optimización de operaciones de lectura/escritura

## Capa de Interfaz

### Controladores HTTP

El módulo expone una API RESTful para la gestión de agentes:

#### Endpoints Principales

```typescript
@Controller('agents')
export class AgentsController {
  @Post()
  createAgent(@Body() createAgentDto: CreateAgentDto)

  @Get()
  getAllAgents()

  @Get(':id')
  getAgentById(@Param('id') id: string)

  @Put(':id')
  updateAgent(
    @Param('id') id: string,
    @Body() updateAgentDto: Partial<CreateAgentDto>
  )

  @Delete(':id')
  deleteAgent(@Param('id') id: string)

  @Post(':id/capabilities')
  addCapability(
    @Param('id') id: string,
    @Body() capability: AgentCapability
  )
}
```

### DTOs de Respuesta

```typescript
interface AgentResponseDto {
  id: string;
  name: string;
  role: {
    name: string;
    description: string;
    responsibilities: string[];
  };
  capabilities: Array<{
    name: string;
    type: string;
    description: string;
    parameters: any[];
  }>;
  description: string;
  goals: string[];
  createdAt: string;
  updatedAt: string;
}
```

### Manejo de Errores

El módulo implementa filtros de excepción personalizados:
- Validación de entrada
- Errores de negocio
- Errores de persistencia
- Errores de sistema

## Conclusiones

El módulo de Agentes proporciona una base sólida para la gestión de agentes autónomos con:

### Características Clave
- Arquitectura limpia y modular
- Dominio rico y bien definido
- Persistencia flexible
- API RESTful completa

### Puntos Fuertes
1. **Extensibilidad**
   - Fácil adición de nuevos roles
   - Capacidades personalizables
   - Arquitectura pluggable

2. **Mantenibilidad**
   - Separación clara de responsabilidades
   - Tests unitarios y de integración
   - Documentación completa

3. **Escalabilidad**
   - Diseño orientado a microservicios
   - Persistencia distribuida
   - Operaciones asíncronas

### Próximos Pasos
1. Implementar sistema de eventos
2. Añadir más capacidades predefinidas
3. Mejorar la gestión de memoria
4. Integrar con el módulo de tareas
