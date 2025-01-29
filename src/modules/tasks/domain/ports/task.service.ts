import { Task } from '../entities/task.entity';
import { TaskStatus } from '../enums/task-status.enum';
import { TaskPriority } from '../enums/task-priority.enum';
import { TaskResult } from '../value-objects/task-result.vo';
import { Agent } from '../../../agents/domain/entities/agent.entity';

export interface CreateTaskDto {
  title: string;
  description: string;
  priority: TaskPriority;
  parentId?: string;
  dependencies?: string[];
  metadata?: Record<string, any>;
  dueDate?: string;
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  priority?: TaskPriority;
  metadata?: Record<string, any>;
  dueDate?: string;
}

export interface TaskService {
  // Core operations
  createTask(dto: CreateTaskDto): Promise<Task>;
  getTaskById(id: string): Promise<Task>;
  updateTask(id: string, dto: UpdateTaskDto): Promise<Task>;
  deleteTask(id: string): Promise<void>;
  
  // Task lifecycle management
  startTask(id: string, agent: Agent): Promise<Task>;
  completeTask(id: string, result: TaskResult): Promise<Task>;
  failTask(id: string, error: string): Promise<Task>;
  cancelTask(id: string, reason: string): Promise<Task>;
  blockTask(id: string, reason: string): Promise<Task>;
  unblockTask(id: string): Promise<Task>;
  
  // Assignment operations
  assignTask(id: string, agent: Agent): Promise<Task>;
  unassignTask(id: string): Promise<Task>;
  reassignTask(id: string, newAgent: Agent): Promise<Task>;
  
  // Task querying
  getTasks(filters?: {
    status?: TaskStatus;
    priority?: TaskPriority;
    agentId?: string;
    parentId?: string;
  }): Promise<Task[]>;
  getTasksByStatus(status: TaskStatus): Promise<Task[]>;
  getTasksByPriority(priority: TaskPriority): Promise<Task[]>;
  getTasksByAgent(agentId: string): Promise<Task[]>;
  getBlockedTasks(): Promise<Task[]>;
  getOverdueTasks(): Promise<Task[]>;
  
  // Dependency management
  addTaskDependency(taskId: string, dependencyId: string): Promise<void>;
  removeTaskDependency(taskId: string, dependencyId: string): Promise<void>;
  getTaskDependencies(taskId: string): Promise<Task[]>;
  getTaskDependents(taskId: string): Promise<Task[]>;
  checkDependenciesMet(taskId: string): Promise<boolean>;
  
  // Batch operations
  createTasks(dtos: CreateTaskDto[]): Promise<Task[]>;
  updateTasks(updates: { id: string; dto: UpdateTaskDto }[]): Promise<Task[]>;
  deleteTasks(ids: string[]): Promise<void>;
  
  // Analytics
  getTaskStatistics(): Promise<{
    byStatus: Record<TaskStatus, number>;
    byPriority: Record<TaskPriority, number>;
    byAgent: Record<string, number>;
  }>;
  
  // Validation
  validateTask(task: Task): Promise<boolean>;
  canStart(taskId: string): Promise<{ can: boolean; reason?: string }>;
  canComplete(taskId: string): Promise<{ can: boolean; reason?: string }>;
}
