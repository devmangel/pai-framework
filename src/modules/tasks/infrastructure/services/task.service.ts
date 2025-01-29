import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { TaskService, CreateTaskDto, UpdateTaskDto } from '../../domain/ports/task.service';
import { TaskRepository } from '../../domain/ports/task.repository';
import { Task } from '../../domain/entities/task.entity';
import { TaskStatus } from '../../domain/enums/task-status.enum';
import { TaskPriority } from '../../domain/enums/task-priority.enum';
import { TaskResult } from '../../domain/value-objects/task-result.vo';
import { Agent } from '../../../agents/domain/entities/agent.entity';

@Injectable()
export class TaskServiceImpl implements TaskService {
  constructor(private readonly taskRepository: TaskRepository) {}

  async createTask(dto: CreateTaskDto): Promise<Task> {
    const task = Task.create(
      dto.title,
      dto.description,
      dto.priority,
      dto.parentId,
      dto.dependencies,
      dto.metadata
    );

    return this.taskRepository.create(task);
  }

  async getTaskById(id: string): Promise<Task> {
    const task = await this.taskRepository.findById(id);
    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
    return task;
  }

  async updateTask(id: string, dto: UpdateTaskDto): Promise<Task> {
    const task = await this.getTaskById(id);

    if (dto.title) {
      task.updateTitle(dto.title);
    }
    if (dto.description) {
      task.updateDescription(dto.description);
    }
    if (dto.priority) {
      task.updatePriority(dto.priority);
    }
    if (dto.metadata) {
      task.updateMetadata(dto.metadata);
    }

    return this.taskRepository.update(task);
  }

  async deleteTask(id: string): Promise<void> {
    const task = await this.getTaskById(id);
    if (task.isInProgress()) {
      throw new BadRequestException('Cannot delete a task that is in progress');
    }
    await this.taskRepository.delete(id);
  }

  async startTask(id: string, agent: Agent): Promise<Task> {
    const task = await this.getTaskById(id);
    const canStart = await this.canStart(id);
    
    if (!canStart.can) {
      throw new BadRequestException(canStart.reason || 'Task cannot be started');
    }

    task.start(agent);
    return this.taskRepository.update(task);
  }

  async completeTask(id: string, result: TaskResult): Promise<Task> {
    const task = await this.getTaskById(id);
    const canComplete = await this.canComplete(id);
    
    if (!canComplete.can) {
      throw new BadRequestException(canComplete.reason || 'Task cannot be completed');
    }

    task.complete(result);
    return this.taskRepository.update(task);
  }

  async failTask(id: string, error: string): Promise<Task> {
    const task = await this.getTaskById(id);
    task.fail(error);
    return this.taskRepository.update(task);
  }

  async cancelTask(id: string, reason: string): Promise<Task> {
    const task = await this.getTaskById(id);
    task.cancel(reason);
    return this.taskRepository.update(task);
  }

  async blockTask(id: string, reason: string): Promise<Task> {
    const task = await this.getTaskById(id);
    task.block(reason);
    return this.taskRepository.update(task);
  }

  async unblockTask(id: string): Promise<Task> {
    const task = await this.getTaskById(id);
    if (!task.isBlocked()) {
      throw new BadRequestException('Task is not blocked');
    }

    task.unblock();
    return this.taskRepository.update(task);
  }

  async assignTask(id: string, agent: Agent): Promise<Task> {
    const task = await this.getTaskById(id);
    task.assignTo(agent);
    return this.taskRepository.update(task);
  }

  async unassignTask(id: string): Promise<Task> {
    const task = await this.getTaskById(id);
    task.unassign();
    return this.taskRepository.update(task);
  }

  async reassignTask(id: string, newAgent: Agent): Promise<Task> {
    const task = await this.getTaskById(id);
    task.assignTo(newAgent);
    return this.taskRepository.update(task);
  }

  async getTasks(filters?: {
    status?: TaskStatus;
    priority?: TaskPriority;
    agentId?: string;
    parentId?: string;
  }): Promise<Task[]> {
    return this.taskRepository.findAll(filters);
  }

  async getTasksByStatus(status: TaskStatus): Promise<Task[]> {
    return this.taskRepository.findByStatus(status);
  }

  async getTasksByPriority(priority: TaskPriority): Promise<Task[]> {
    return this.taskRepository.findByPriority(priority);
  }

  async getTasksByAgent(agentId: string): Promise<Task[]> {
    return this.taskRepository.findByAgent(agentId);
  }

  async getBlockedTasks(): Promise<Task[]> {
    return this.taskRepository.findBlocked();
  }

  async getOverdueTasks(): Promise<Task[]> {
    return this.taskRepository.findOverdue();
  }

  async addTaskDependency(taskId: string, dependencyId: string): Promise<void> {
    if (taskId === dependencyId) {
      throw new BadRequestException('Task cannot depend on itself');
    }

    const [task, dependency] = await Promise.all([
      this.getTaskById(taskId),
      this.getTaskById(dependencyId),
    ]);

    // Check for circular dependencies
    const dependents = await this.getTaskDependents(dependencyId);
    if (dependents.some(t => t.getId() === taskId)) {
      throw new BadRequestException('Circular dependency detected');
    }

    task.addDependency(dependencyId);
    await this.taskRepository.update(task);
  }

  async removeTaskDependency(taskId: string, dependencyId: string): Promise<void> {
    const task = await this.getTaskById(taskId);
    task.removeDependency(dependencyId);
    await this.taskRepository.update(task);
  }

  async getTaskDependencies(taskId: string): Promise<Task[]> {
    return this.taskRepository.findDependencies(taskId);
  }

  async getTaskDependents(taskId: string): Promise<Task[]> {
    return this.taskRepository.findDependents(taskId);
  }

  async checkDependenciesMet(taskId: string): Promise<boolean> {
    const dependencies = await this.getTaskDependencies(taskId);
    return dependencies.every(task => task.isCompleted());
  }

  async createTasks(dtos: CreateTaskDto[]): Promise<Task[]> {
    const tasks = dtos.map(dto => Task.create(
      dto.title,
      dto.description,
      dto.priority,
      dto.parentId,
      dto.dependencies,
      dto.metadata
    ));

    return this.taskRepository.createMany(tasks);
  }

  async updateTasks(updates: { id: string; dto: UpdateTaskDto }[]): Promise<Task[]> {
    const tasks = await Promise.all(
      updates.map(async ({ id, dto }) => {
        const task = await this.getTaskById(id);
        if (dto.title) task.updateTitle(dto.title);
        if (dto.description) task.updateDescription(dto.description);
        if (dto.priority) task.updatePriority(dto.priority);
        if (dto.metadata) task.updateMetadata(dto.metadata);
        return task;
      })
    );

    return this.taskRepository.updateMany(tasks);
  }

  async deleteTasks(ids: string[]): Promise<void> {
    const tasks = await Promise.all(ids.map(id => this.getTaskById(id)));
    if (tasks.some(task => task.isInProgress())) {
      throw new BadRequestException('Cannot delete tasks that are in progress');
    }
    await this.taskRepository.deleteMany(ids);
  }

  async getTaskStatistics(): Promise<{
    byStatus: Record<TaskStatus, number>;
    byPriority: Record<TaskPriority, number>;
    byAgent: Record<string, number>;
  }> {
    const [byStatus, byPriority, byAgent] = await Promise.all([
      this.taskRepository.countByStatus(),
      this.taskRepository.countByPriority(),
      this.taskRepository.countByAgent(),
    ]);

    return {
      byStatus,
      byPriority,
      byAgent,
    };
  }

  async validateTask(task: Task): Promise<boolean> {
    try {
      task.validate();
      return true;
    } catch {
      return false;
    }
  }

  async canStart(taskId: string): Promise<{ can: boolean; reason?: string }> {
    const task = await this.getTaskById(taskId);

    if (task.isCompleted()) {
      return { can: false, reason: 'Task is already completed' };
    }

    if (task.isInProgress()) {
      return { can: false, reason: 'Task is already in progress' };
    }

    if (task.isBlocked()) {
      return { can: false, reason: 'Task is blocked' };
    }

    const dependenciesMet = await this.checkDependenciesMet(taskId);
    if (!dependenciesMet) {
      return { can: false, reason: 'Not all dependencies are completed' };
    }

    return { can: true };
  }

  async canComplete(taskId: string): Promise<{ can: boolean; reason?: string }> {
    const task = await this.getTaskById(taskId);

    if (!task.isInProgress()) {
      return { can: false, reason: 'Task must be in progress to complete' };
    }

    if (task.isBlocked()) {
      return { can: false, reason: 'Task is blocked' };
    }

    return { can: true };
  }
}
