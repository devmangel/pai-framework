import { Injectable, Inject } from '@nestjs/common';
import { TaskService } from '../../../tasks/domain/ports/task.service';
import { AgentRepository, AgentNotFoundError } from '../../domain/ports/agent.repository';
import { CreateAgentDto } from '../../interface/http/dtos/create-agent.dto';
import { UpdateAgentDto } from '../../interface/http/dtos/update-agent.dto';
import { Agent } from '../../domain/entities/agent.entity';
import { AgentId } from '../../domain/value-objects/agent-id.vo';
import { TaskResult } from '../../../tasks/domain/value-objects/task-result.vo';
import { AgentRole } from '../../domain/value-objects/agent-role.vo';

export interface AgentsService {
  createAgent(dto: CreateAgentDto): Promise<Agent>;
  updateAgent(id: string, dto: UpdateAgentDto): Promise<Agent>;
  deleteAgent(id: string): Promise<void>;
  assignTask(agentId: string, taskId: string): Promise<void>;
  startTask(agentId: string, taskId: string): Promise<void>;
  completeTask(agentId: string, taskId: string, result: TaskResult): Promise<void>;
  failTask(agentId: string, taskId: string, error: string): Promise<void>;
  findAgentById(id: string): Promise<Agent>;
  // Additional methods as needed
}

@Injectable()
export class AgentsServiceImpl implements AgentsService {
  constructor(
    @Inject('TASK_SERVICE') private readonly taskService: TaskService,
    @Inject('AGENT_REPOSITORY') private readonly agentRepository: AgentRepository,
  ) { }

  async createAgent(dto: CreateAgentDto): Promise<Agent> {
    const agent = Agent.create(dto.name, new AgentRole(dto.role.name, dto.role.description, dto.role.responsibilities), [], dto.description, []);
    await this.agentRepository.save(agent);
    return agent;
  }

  async updateAgent(id: string, dto: UpdateAgentDto): Promise<Agent> {
    const agent = await this.agentRepository.findById(new AgentId(id));
    if (!agent) throw new AgentNotFoundError(id);
    agent.updateName(dto.name);
    agent.updateDescription(dto.description);
    await this.agentRepository.save(agent);
    return agent;
  }

  async deleteAgent(id: string): Promise<void> {
    await this.agentRepository.delete(new AgentId(id));
  }

  async assignTask(agentId: string, taskId: string): Promise<void> {
    const agent = await this.agentRepository.findById(new AgentId(agentId));
    if (!agent) throw new AgentNotFoundError(agentId);
    await this.taskService.assignTask(taskId, agent);
  }

  async startTask(agentId: string, taskId: string): Promise<void> {
    const agent = await this.agentRepository.findById(new AgentId(agentId));
    if (!agent) throw new AgentNotFoundError(agentId);
    await this.taskService.startTask(taskId, agent);
  }

  async completeTask(agentId: string, taskId: string, result: TaskResult): Promise<void> {
    const agent = await this.agentRepository.findById(new AgentId(agentId));
    if (!agent) throw new AgentNotFoundError(agentId);
    await this.taskService.completeTask(taskId, result);
  }

  async failTask(agentId: string, taskId: string, error: string): Promise<void> {
    const agent = await this.agentRepository.findById(new AgentId(agentId));
    if (!agent) throw new AgentNotFoundError(agentId);
    await this.taskService.failTask(taskId, error);
  }

  async findAgentById(id: string): Promise<Agent> {
    return this.agentRepository.findById(new AgentId(id));
  }

  // Additional methods as needed
}
