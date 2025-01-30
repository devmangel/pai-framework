import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

// Importa los handlers
import { AgentAssignedToTaskHandler } from './application/event-handlers/agent-assigned-to-task.handler';
import { TeamCreatedHandler } from './application/event-handlers/team-created.handler';

// Importa los servicios de orquestación
import { OrchestratorAgentsService } from './application/services/orchestrator-agents.service';
import { OrchestratorTeamsService } from './application/services/orchestrator-teams.service';

// Consumer de RabbitMQ
import { RabbitMQConsumer } from './infrastructure/rabbitmq/rabbitmq.consumer';

// Importa otros módulos si necesitas inyectar sus servicios
import { AgentsModule } from '../agents/agents.module';
import { TasksModule } from '../tasks/tasks.module';
import { LLMModule } from '../llm/llm.module';
import { MemoryModule } from '../memory/memory.module';
import { ToolsModule } from '../tools/tools.module';
import { TeamsModule } from '../teams/teams.module';

@Module({
  imports: [
    CqrsModule,
    AgentsModule,
    TasksModule,
    LLMModule,
    MemoryModule,
    ToolsModule,
    TeamsModule,
  ],
  providers: [
    // Servicios de aplicación
    OrchestratorAgentsService,
    OrchestratorTeamsService,

    // Event Handlers (CQRS)
    AgentAssignedToTaskHandler,
    TeamCreatedHandler,

    // RabbitMQ Consumer
    RabbitMQConsumer,
  ],
  exports: [
    OrchestratorAgentsService,
    OrchestratorTeamsService,
  ],
})
export class OrchestrationModule { }
