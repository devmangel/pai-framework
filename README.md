# AgentsAI Framework

Un framework TypeScript/NestJS para la construcción y gestión de agentes de IA autónomos, inspirado en CrewAI, diseñado para permitir la colaboración, comunicación y ejecución de tareas complejas entre agentes.

## Estado del Proyecto

El proyecto implementa una arquitectura hexagonal robusta con los siguientes módulos principales:

### Módulos Implementados ✅

- **Agents**: Sistema base de agentes con persistencia en DynamoDB
- **LLM**: Integración con proveedores de LLM (OpenAI) y sistema de caché
- **Tasks**: Gestión de tareas, dependencias y flujos de trabajo
- **Teams**: Colaboración y comunicación entre agentes
- **Tools**: Sistema extensible de herramientas con caché integrado

### En Desarrollo 🚧

- Sistema de memoria para agentes
- Integración con más proveedores LLM
- Sistema de plugins
- WebSocket para comunicación en tiempo real
- Integración con WhatsApp
- Documentación OpenAPI

## Arquitectura

El proyecto sigue una arquitectura hexagonal (ports and adapters) con una clara separación de responsabilidades:

```
src/
├── modules/
│   ├── agents/              # Gestión de agentes
│   │   ├── domain/         # Entidades, value objects y puertos
│   │   │   ├── entities/   # Agent, AgentConfig
│   │   │   ├── ports/      # Repositorios e interfaces
│   │   │   └── vo/         # Value Objects
│   │   ├── application/    # Casos de uso y servicios
│   │   ├── infrastructure/ # Implementaciones y servicios externos
│   │   └── interface/      # Controladores y DTOs
│   │
│   ├── llm/                # Integración con modelos de lenguaje
│   │   ├── domain/        # Abstracciones de LLM
│   │   ├── infrastructure/# Implementaciones (OpenAI, etc.)
│   │   └── interface/     # API REST para LLM
│   │
│   ├── tasks/              # Gestión de tareas
│   │   ├── domain/        # Task, TaskStatus, TaskPriority
│   │   ├── application/   # Workflow, TaskExecution
│   │   └── infrastructure/# TaskRepository, TaskScheduler
│   │
│   ├── teams/              # Coordinación de equipos
│   │   ├── domain/        # Team, TeamMember, Channel
│   │   ├── application/   # TeamManagement, Communication
│   │   └── interface/     # TeamController, WebSocket
│   │
│   └── tools/              # Herramientas y capacidades
│       ├── domain/        # Tool, ToolType
│       ├── infrastructure/# Implementaciones de tools
│       └── interface/     # ToolController
│
├── common/                 # Utilidades compartidas
├── config/                 # Gestión de configuración
└── main.ts                # Punto de entrada
```

### Patrones de Diseño Implementados

- **Domain-Driven Design**: Entidades ricas y value objects
- **Repository Pattern**: Abstracción de persistencia
- **Factory Pattern**: Creación de objetos complejos
- **Strategy Pattern**: Comportamientos intercambiables
- **Observer Pattern**: Eventos y notificaciones
- **Decorator Pattern**: Aspectos transversales

## Documentación

Cada módulo cuenta con documentación detallada:

- [Módulo de Agentes](docs/modules/agents.md)
- [Módulo LLM](docs/modules/llm.md)
- [Módulo de Tareas](docs/modules/tasks.md)
- [Módulo de Equipos](docs/modules/teams.md)
- [Módulo de Herramientas](docs/modules/tools.md)

## Requisitos

- Node.js (v18 o superior)
- npm o yarn
- DynamoDB Local (desarrollo)
- Redis (opcional, para caché)

## Configuración

1. Clonar el repositorio:
   ```bash
   git clone <repository-url>
   cd agentsAI
   ```

2. Instalar dependencias:
   ```bash
   npm install
   ```

3. Configurar variables de entorno:
   ```bash
   cp .env.example .env
   # Editar .env con tu configuración
   ```

4. Iniciar DynamoDB Local:
   ```bash
   docker run -p 8000:8000 amazon/dynamodb-local
   ```

5. Ejecutar la aplicación:
   ```bash
   # Desarrollo
   npm run start:dev

   # Producción
   npm run build
   npm run start:prod
   ```

## Desarrollo

### Estándares de Código

- Seguir las mejores prácticas de NestJS
- Implementar arquitectura hexagonal
- Escribir pruebas unitarias para lógica de dominio
- Documentar APIs públicas

### Testing

```bash
# Pruebas unitarias
npm run test

# Pruebas E2E
npm run test:e2e

# Cobertura
npm run test:cov
```

## Variables de Entorno

```env
# Server
PORT=3000
NODE_ENV=development

# Database
DYNAMODB_ENDPOINT=http://localhost:8000
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=local
AWS_SECRET_ACCESS_KEY=local

# LLM
OPENAI_API_KEY=your-api-key
DEFAULT_MODEL=gpt-4
CACHE_TTL=3600

# Redis (opcional)
REDIS_HOST=localhost
REDIS_PORT=6379
```

## Próximos Pasos

### Fase 1: Mejoras Core
- [ ] Sistema de memoria para agentes
- [ ] Integración con Claude y Gemini
- [ ] Sistema de plugins extensible

### Fase 2: Comunicación
- [ ] WebSocket para tiempo real
- [ ] Integración con WhatsApp
- [ ] Sistema de notificaciones

### Fase 3: Documentación y Tooling
- [ ] Documentación OpenAPI completa
- [ ] CLI para gestión de agentes
- [ ] Dashboard de administración

### Fase 4: Escalabilidad
- [ ] Soporte para múltiples bases de datos
- [ ] Sistema de colas distribuido
- [ ] Monitoreo y telemetría

## Contribuir

1. Fork del repositorio
2. Crear rama de feature
3. Commit de cambios
4. Push a la rama
5. Crear Pull Request

### Guía de Contribución

- Seguir estilo de código establecido
- Incluir pruebas para nueva funcionalidad
- Actualizar documentación relevante
- Referenciar issues relacionados

## Licencia

[MIT License](LICENSE)
