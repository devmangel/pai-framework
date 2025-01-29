import { Injectable, Inject } from '@nestjs/common';
import { 
  TaskService as ITaskService,
  CreateTaskDto,
  UpdateTaskDto
} from '../../domain/ports/task.service';
import { TaskRepository, TASK_REPOSITORY } from '../../domain/ports/task.repository';
import { Task } from '../../domain/entities/task.entity';
import { TaskStatus } from '../../domain/enums/task-status.enum';
import { TaskPriority } from '../../domain/enums/task-priority.enum';
import { TaskResult } from '../../domain/value-objects/task-result.vo';
import { Agent } from '../../../agents/domain/entities/agent.entity';

@Injectable()
export class TaskServiceImpl implements ITaskService {
  constructor(
    @Inject(TASK_REPOSITORY)
    private readonly taskRepository: TaskRepository,
  ) {}

  async createTask(dto: CreateTaskDto): Promise<Task> {
    const task = Task.create(
      dto.title,
      dto.description,
      dto.priority,
      dto.parentId,
      dto.dependencies,
      dto.metadata,
      dto.dueDate ? new Date(dto.dueDate) : null
    );
    await this.taskRepository.save(task);
    return task;
  }

  async getTaskById(id: string): Promise<Task> {
    const task = await this.taskRepository.findById(id);
    if (!task) {
      throw new Error('Task not found');
    }
    return task;
  }

  async updateTask(id: string, dto: UpdateTaskDto): Promise<Task> {
    const task = await this.getTaskById(id);
    
    if (dto.title) task.updateTitle(dto.title);
    if (dto.description) task.updateDescription(dto.description);
    if (dto.priority) task.updatePriority(dto.priority);
    if (dto.metadata) task.updateMetadata(dto.metadata);
    if (dto.dueDate) task.updateDueDate(new Date(dto.dueDate));
    
    await this.taskRepository.save(task);
    return task;
  }

  async deleteTask(id: string): Promise<void> {
    await this.taskRepository.delete(id);
  }

  async startTask(id: string, agent: Agent): Promise<Task> {
    const task = await this.getTaskById(id);
    task.start(agent);
    await this.taskRepository.save(task);
    return task;
  }

  async completeTask(id: string, result: TaskResult): Promise<Task> {
    const task = await this.getTaskById(id);
    task.complete(result);
    await this.taskRepository.save(task);
    return task;
  }

  async failTask(id: string, error: string): Promise<Task> {
    const task = await this.getTaskById(id);
    task.fail(error);
    await this.taskRepository.save(task);
    return task;
  }

  async cancelTask(id: string, reason: string): Promise<Task> {
    const task = await this.getTaskById(id);
    task.cancel(reason);
    await this.taskRepository.save(task);
    return task;
  }

  async blockTask(id: string, reason: string): Promise<Task> {
    const task = await this.getTaskById(id);
    task.block(reason);
    await this.taskRepository.save(task);
    return task;
  }

  async unblockTask(id: string): Promise<Task> {
    const task = await this.getTaskById(id);
    task.unblock();
    await this.taskRepository.save(task);
    return task;
  }

  async assignTask(id: string, agent: Agent): Promise<Task> {
    const task = await this.getTaskById(id);
    task.assignTo(agent);
    await this.taskRepository.save(task);
    return task;
  }

  async unassignTask(id: string): Promise<Task> {
    const task = await this.getTaskById(id);
    task.unassign();
    await this.taskRepository.save(task);
    return task;
  }

  async reassignTask(id: string, newAgent: Agent): Promise<Task> {
    const task = await this.getTaskById(id);
    task.assignTo(newAgent);
    await this.taskRepository.save(task);
    return task;
  }

  async getTasks(filters?: {
    status?: TaskStatus;
    priority?: TaskPriority;
    agentId?: string;
    parentId?: string;
  }): Promise<Task[]> {
    if (filters?.status) {
      return this.taskRepository.findByStatus(filters.status);
    }
    if (filters?.priority) {
      return this.taskRepository.findByPriority(filters.priority);
    }
    if (filters?.agentId) {
      return this.taskRepository.findByAgent(filters.agentId);
    }
    if (filters?.parentId) {
      return this.taskRepository.findByParent(filters.parentId);
    }
    return this.taskRepository.findAll();
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
    const task = await this.getTaskById(taskId);
    task.addDependency(dependencyId);
    await this.taskRepository.save(task);
  }

  async removeTaskDependency(taskId: string, dependencyId: string): Promise<void> {
    const task = await this.getTaskById(taskId);
    task.removeDependency(dependencyId);
    await this.taskRepository.save(task);
  }

  async getTaskDependencies(taskId: string): Promise<Task[]> {
    return this.taskRepository.findDependencies(taskId);
  }

  async getTaskDependents(taskId: string): Promise<Task[]> {
    return this.taskRepository.findDependents(taskId);
  }

  async checkDependenciesMet(taskId: string): Promise<boolean> {
    const dependencies = await this.getTaskDependencies(taskId);
    return dependencies.every(task => task.getStatus() === TaskStatus.COMPLETED);
  }

  async createTasks(dtos: CreateTaskDto[]): Promise<Task[]> {
    const tasks = await Promise.all(dtos.map(dto => this.createTask(dto)));
    return tasks;
  }

  async updateTasks(updates: { id: string; dto: UpdateTaskDto }[]): Promise<Task[]> {
    const tasks = await Promise.all(
      updates.map(update => this.updateTask(update.id, update.dto))
    );
    return tasks;
  }

  async deleteTasks(ids: string[]): Promise<void> {
    await this.taskRepository.deleteMany(ids);
  }

  async getTaskStatistics(): Promise<{
    byStatus: Record<TaskStatus, number>;
    byPriority: Record<TaskPriority, number>;
    byAgent: Record<string, number>;
  }> {
    const tasks = await this.taskRepository.findAll();
    
    const byStatus = Object.values(TaskStatus).reduce((acc, status) => {
      acc[status] = tasks.filter(task => task.getStatus() === status).length;
      return acc;
    }, {} as Record<TaskStatus, number>);

    const byPriority = Object.values(TaskPriority).reduce((acc, priority) => {
      acc[priority] = tasks.filter(task => task.getPriority() === priority).length;
      return acc;
    }, {} as Record<TaskPriority, number>);

    const byAgent = tasks.reduce((acc, task) => {
      const agent = task.getAssignedAgent();
      if (agent) {
        const id = agent.getId().toString();
        acc[id] = (acc[id] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    return { byStatus, byPriority, byAgent };
  }

  async validateTask(task: Task): Promise<boolean> {
    // TODO: Implement validation logic
    return true;
  }

  async canStart(taskId: string): Promise<{ can: boolean; reason?: string }> {
    const task = await this.getTaskById(taskId);
    
    if (task.getStatus() !== TaskStatus.PENDING) {
      return { can: false, reason: 'Task is not in PENDING state' };
    }

    const dependenciesMet = await this.checkDependenciesMet(taskId);
    if (!dependenciesMet) {
      return { can: false, reason: 'Not all dependencies are completed' };
    }

    return { can: true };
  }

  async canComplete(taskId: string): Promise<{ can: boolean; reason?: string }> {
    const task = await this.getTaskById(taskId);
    
    if (task.getStatus() !== TaskStatus.IN_PROGRESS) {
      return { can: false, reason: 'Task is not in IN_PROGRESS state' };
    }

    return { can: true };
  }
}
