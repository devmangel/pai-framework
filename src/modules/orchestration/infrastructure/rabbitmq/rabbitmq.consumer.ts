import { Injectable } from '@nestjs/common';
import { OrchestratorAgentsService } from '../../application/services/orchestrator-agents.service';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';

/**
 * Ejemplo de consumer para RabbitMQ que escucha
 * el exchange 'tasks' con routing key 'task.assigned'
 */
@Injectable()
export class RabbitMQConsumer {
  constructor(
    private readonly orchestratorAgentsService: OrchestratorAgentsService,
  ) {}

  @RabbitSubscribe({
    exchange: 'tasks',
    routingKey: 'task.assigned',
    queue: 'task_assigned_queue',
  })
  public async handleTaskAssigned(msg: { agentId: string; taskId: string }) {
    // Llama al orquestador de agentes cuando llega el mensaje
    await this.orchestratorAgentsService.runTask(msg.agentId, msg.taskId);
  }
}
