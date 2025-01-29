import { Task } from '../entities/task.entity';
import { TaskStatus } from '../enums/task-status.enum';
import { TaskPriority } from '../enums/task-priority.enum';

export interface TaskRepository {
  save(task: Task): Promise<void>;
  findById(id: string): Promise<Task | null>;
  findAll(): Promise<Task[]>;
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
  saveMany(tasks: Task[]): Promise<void>;
  deleteMany(ids: string[]): Promise<void>;
}

export const TASK_REPOSITORY = Symbol('TaskRepository');
