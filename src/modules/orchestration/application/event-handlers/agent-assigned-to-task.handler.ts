import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { AgentAssignedToTaskEvent } from '../../domain/events/agent-assigned-to-task.event';
import { OrchestratorAgentsService } from '../services/orchestrator-agents.service';

@EventsHandler(AgentAssignedToTaskEvent)
export class AgentAssignedToTaskHandler implements IEventHandler<AgentAssignedToTaskEvent> {
  private readonly logger = new Logger(AgentAssignedToTaskHandler.name);

  constructor(
    private readonly orchestratorAgentsService: OrchestratorAgentsService,
  ) {}

  async handle(event: AgentAssignedToTaskEvent) {
    this.logger.log(
      `Handling AgentAssignedToTaskEvent -> Agent: ${event.agentId}, Task: ${event.taskId}`
    );
    // Llama al servicio de orquestación para iniciar el flujo
    await this.orchestratorAgentsService.runTask(event.agentId, event.taskId);
  }
}
