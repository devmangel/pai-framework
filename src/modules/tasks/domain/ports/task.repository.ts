import { Task } from '../entities/task.entity';
import { TaskStatus } from '../enums/task-status.enum';
import { TaskPriority } from '../enums/task-priority.enum';

export interface TaskRepository {
  create(task: Task): Promise<Task>;
  findById(id: string): Promise<Task | null>;
  findAll(filters?: {
    status?: TaskStatus;
    priority?: TaskPriority;
    agentId?: string;
    parentId?: string;
  }): Promise<Task[]>;
  update(task: Task): Promise<Task>;
  delete(id: string): Promise<void>;
  
  // Specialized queries
  findByStatus(status: TaskStatus): Promise<Task[]>;
  findByPriority(priority: TaskPriority): Promise<Task[]>;
  findByAgent(agentId: string): Promise<Task[]>;
  findChildren(parentId: string): Promise<Task[]>;
  findBlocked(): Promise<Task[]>;
  findOverdue(): Promise<Task[]>;
  
  // Batch operations
  createMany(tasks: Task[]): Promise<Task[]>;
  updateMany(tasks: Task[]): Promise<Task[]>;
  deleteMany(ids: string[]): Promise<void>;
  
  // Dependency management
  addDependency(taskId: string, dependencyId: string): Promise<void>;
  removeDependency(taskId: string, dependencyId: string): Promise<void>;
  getDependencies(taskId: string): Promise<Task[]>;
  getDependents(taskId: string): Promise<Task[]>;
  
  // Statistics
  countByStatus(): Promise<Record<TaskStatus, number>>;
  countByPriority(): Promise<Record<TaskPriority, number>>;
  countByAgent(): Promise<Record<string, number>>;
}
