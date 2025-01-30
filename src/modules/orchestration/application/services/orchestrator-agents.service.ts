import { Injectable, Logger } from '@nestjs/common';

// Ejemplo de import de interfaces/servicios de otros módulos
import { AgentsService } from '../../../agents/application/services/agent-application.service';
import { TaskServiceImpl } from '../../../tasks/application/services/task-application.service';
import { LLMService } from '../../../llm/domain/ports/llm.service';
import { ToolService } from '../../../tools/application/services/tool-application.service';
import { MemoryRepository } from '../../../memory/domain/ports/memory.repository';

@Injectable()
export class OrchestratorAgentsService {
  private readonly logger = new Logger(OrchestratorAgentsService.name);

  constructor(
    private readonly agentsService: AgentsService,
    private readonly tasksService: TaskServiceImpl,
    private readonly llmService: LLMService,
    private readonly toolsService: ToolService,
    private readonly memoryRepository: MemoryRepository,
  ) {}

  /**
   * Orquesta el flujo cuando un agente recibe una tarea.
   * Ejemplo simplificado con un ciclo de "razonamiento" e invocación de Tools y LLM.
   */
  async runTask(agentId: string, taskId: string): Promise<void> {
    this.logger.log(`Starting orchestration for Agent ${agentId}, Task ${taskId}`);

    // 1. Verifica existencia de agente y tarea
    const agent = await this.agentsService.findAgentById(agentId);
    const task = await this.tasksService.getTaskById(taskId);

    if (!agent || !task) {
      this.logger.warn(`Either agent ${agentId} or task ${taskId} not found`);
      return;
    }

    // 2. Bucle de razonamiento (muy simplificado)
    let done = false;

    while (!done) {
      // a) Construir prompt a la LLM
      const prompt = this.buildPrompt(agent, task);

      // b) Llamar a la LLM
      const completion = await this.llmService.complete({
        messages: [{ role: 'system', content: prompt }],
        model: 'gpt-4',
      });

      // c) Interpretar acción a tomar
      const action = this.decideAction(completion.content || '');

      // d) Ejecutar Tool si corresponde
      if (action.toolName) {
        const result = await this.toolsService.execute(action.toolName, action.params);
        // Guardar resultado en memoria
        await this.memoryRepository.save({
          id: `memo-${Date.now()}`,
          content: `Tool used: ${action.toolName} - result: ${JSON.stringify(result)}`,
          metadata: { agentId, taskId },
          agentId,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }

      // e) Si la acción implica completar la tarea
      if (action.type === 'complete') {
        await this.tasksService.completeTask(taskId, { result: 'Completed by agent' });
        done = true;
      }

      // f) Lógica de interrupción, errores, etc.
      if (action.type === 'stop') {
        this.logger.log(`Agent ${agentId} stopped the task or can't proceed`);
        done = true;
      }
    }

    this.logger.log(`Agent ${agentId}, Task ${taskId} orchestration ended`);
  }

  /**
   * Construye el prompt base para la LLM (ejemplo mínimo).
   */
  private buildPrompt(agent: any, task: any): string {
    return `You are Agent ${agent.name}, assigned to task: ${task.title}.
Context: ${task.description}
Decide your next action. 
Possible tools: [fileRead, httpRequest, etc.]
Type "complete" to finish the task.`;
  }

  /**
   * Parsea la respuesta de la LLM para decidir qué hacer.
   */
  private decideAction(llmOutput: string): { toolName?: string; params?: any; type?: string } {
    // Ejemplo: si la respuesta contiene la palabra "readFile"
    if (llmOutput.includes('readFile')) {
      return {
        toolName: 'fileRead',
        params: { filePath: './test.txt' },
        type: 'continue',
      };
    } else if (llmOutput.includes('DONE') || llmOutput.includes('complete')) {
      return { type: 'complete' };
    }
    return { type: 'stop' };
  }
}
