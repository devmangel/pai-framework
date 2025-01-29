import { Task } from '../entities/task.entity';
import { TaskStatus } from '../enums/task-status.enum';
import { TaskPriority } from '../enums/task-priority.enum';

export interface TaskRepository {
  create(task: Task): Promise<Task>;
  update(task: Task): Promise<Task>;
  save(task: Task): Promise<void>;
  findById(id: string): Promise<Task | null>;
  findAll(filters?: {
    status?: TaskStatus;
    priority?: TaskPriority;
    agentId?: string;
    parentId?: string;
  }): Promise<Task[]>;
  delete(id: string): Promise<void>;
  findByStatus(status: TaskStatus): Promise<Task[]>;
  findByPriority(priority: TaskPriority): Promise<Task[]>;
  findByAgent(agentId: string): Promise<Task[]>;
  findByParent(parentId: string): Promise<Task[]>;
  findDependencies(taskId: string): Promise<Task[]>;
  findDependents(taskId: string): Promise<Task[]>;
  findBlocked(): Promise<Task[]>;
  findOverdue(): Promise<Task[]>;
  exists(id: string): Promise<boolean>;
  createMany(tasks: Task[]): Promise<Task[]>;
  updateMany(tasks: Task[]): Promise<Task[]>;
  saveMany(tasks: Task[]): Promise<void>;
  deleteMany(ids: string[]): Promise<void>;
  
  // Dependency management
  addDependency(taskId: string, dependencyId: string): Promise<void>;
  removeDependency(taskId: string, dependencyId: string): Promise<void>;
  getDependencies(taskId: string): Promise<Task[]>;
  getDependents(taskId: string): Promise<Task[]>;
  countByStatus(): Promise<Record<TaskStatus, number>>;
  countByPriority(): Promise<Record<TaskPriority, number>>;
  countByAgent(): Promise<Record<string, number>>;
}

export const TASK_REPOSITORY = Symbol('TaskRepository');
