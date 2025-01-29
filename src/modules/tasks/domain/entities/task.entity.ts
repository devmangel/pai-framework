import { v4 as uuidv4 } from 'uuid';
import { TaskStatus } from '../enums/task-status.enum';
import { TaskPriority } from '../enums/task-priority.enum';
import { TaskResult } from '../value-objects/task-result.vo';
import { Agent } from '../../../agents/domain/entities/agent.entity';

export class Task {
  private constructor(
    private readonly id: string,
    private title: string,
    private description: string,
    private status: TaskStatus,
    private priority: TaskPriority,
    private assignedAgent: Agent | null,
    private parentId: string | null,
    private dependencies: string[],
    private metadata: Record<string, any>,
    private result: TaskResult | null,
    private readonly createdAt: Date,
    private updatedAt: Date,
    private startedAt: Date | null,
    private completedAt: Date | null,
    private dueDate: Date | null
  ) {}

  static create(
    title: string,
    description: string,
    priority: TaskPriority,
    parentId: string | null = null,
    dependencies: string[] = [],
    metadata: Record<string, any> = {},
    dueDate: Date | null = null
  ): Task {
    const now = new Date();
    return new Task(
      uuidv4(),
      title,
      description,
      TaskStatus.PENDING,
      priority,
      null,
      parentId,
      dependencies,
      metadata,
      null,
      now,
      now,
      null,
      null,
      dueDate
    );
  }

  // Getters
  getId(): string {
    return this.id;
  }

  getTitle(): string {
    return this.title;
  }

  getDescription(): string {
    return this.description;
  }

  getStatus(): TaskStatus {
    return this.status;
  }

  getPriority(): TaskPriority {
    return this.priority;
  }

  getAssignedAgent(): Agent | null {
    return this.assignedAgent;
  }

  getParentId(): string | null {
    return this.parentId;
  }

  getDependencies(): string[] {
    return [...this.dependencies];
  }

  getMetadata(): Record<string, any> {
    return { ...this.metadata };
  }

  getResult(): TaskResult | null {
    return this.result;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }

  getStartedAt(): Date | null {
    return this.startedAt;
  }

  getCompletedAt(): Date | null {
    return this.completedAt;
  }

  getDueDate(): Date | null {
    return this.dueDate;
  }

  // State changes
  assignTo(agent: Agent): void {
    this.assignedAgent = agent;
    this.updateTimestamp();
  }

  unassign(): void {
    this.assignedAgent = null;
    this.updateTimestamp();
  }

  start(agent: Agent): void {
    if (this.status !== TaskStatus.PENDING) {
      throw new Error('Task can only be started from PENDING state');
    }
    this.status = TaskStatus.IN_PROGRESS;
    this.assignedAgent = agent;
    this.startedAt = new Date();
    this.updateTimestamp();
  }

  complete(result: TaskResult): void {
    if (this.status !== TaskStatus.IN_PROGRESS) {
      throw new Error('Task can only be completed from IN_PROGRESS state');
    }
    this.status = TaskStatus.COMPLETED;
    this.result = result;
    this.completedAt = new Date();
    this.updateTimestamp();
  }

  fail(error: string): void {
    if (this.status !== TaskStatus.IN_PROGRESS) {
      throw new Error('Task can only fail from IN_PROGRESS state');
    }
    this.status = TaskStatus.FAILED;
    this.result = TaskResult.createError(error);
    this.updateTimestamp();
  }

  block(reason: string): void {
    if (this.status === TaskStatus.COMPLETED) {
      throw new Error('Cannot block a completed task');
    }
    this.status = TaskStatus.BLOCKED;
    this.metadata = { ...this.metadata, blockReason: reason };
    this.updateTimestamp();
  }

  unblock(): void {
    if (this.status !== TaskStatus.BLOCKED) {
      throw new Error('Task is not blocked');
    }
    this.status = this.startedAt ? TaskStatus.IN_PROGRESS : TaskStatus.PENDING;
    const { blockReason, ...rest } = this.metadata;
    this.metadata = rest;
    this.updateTimestamp();
  }

  cancel(reason: string): void {
    if (this.status === TaskStatus.COMPLETED) {
      throw new Error('Cannot cancel a completed task');
    }
    this.status = TaskStatus.CANCELLED;
    this.metadata = { ...this.metadata, cancelReason: reason };
    this.updateTimestamp();
  }

  addDependency(taskId: string): void {
    if (!this.dependencies.includes(taskId)) {
      this.dependencies.push(taskId);
      this.updateTimestamp();
    }
  }

  removeDependency(taskId: string): void {
    this.dependencies = this.dependencies.filter(id => id !== taskId);
    this.updateTimestamp();
  }

  updateTitle(title: string): void {
    this.title = title;
    this.updateTimestamp();
  }

  updateDescription(description: string): void {
    this.description = description;
    this.updateTimestamp();
  }

  updatePriority(priority: TaskPriority): void {
    this.priority = priority;
    this.updateTimestamp();
  }

  updateDueDate(dueDate: Date | null): void {
    this.dueDate = dueDate;
    this.updateTimestamp();
  }

  updateMetadata(metadata: Record<string, any>): void {
    this.metadata = { ...this.metadata, ...metadata };
    this.updateTimestamp();
  }

  private updateTimestamp(): void {
    this.updatedAt = new Date();
  }

  toJSON(): Record<string, any> {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      status: this.status,
      priority: this.priority,
      assignedAgent: this.assignedAgent?.getId(),
      parentId: this.parentId,
      dependencies: this.dependencies,
      metadata: this.metadata,
      result: this.result?.toJSON(),
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      startedAt: this.startedAt?.toISOString(),
      completedAt: this.completedAt?.toISOString(),
      dueDate: this.dueDate?.toISOString(),
    };
  }

  static fromJSON(json: Record<string, any>): Task {
    return new Task(
      json.id,
      json.title,
      json.description,
      json.status as TaskStatus,
      json.priority as TaskPriority,
      null, // Agent will need to be rehydrated separately
      json.parentId,
      json.dependencies,
      json.metadata,
      json.result ? TaskResult.fromJSON(json.result) : null,
      new Date(json.createdAt),
      new Date(json.updatedAt),
      json.startedAt ? new Date(json.startedAt) : null,
      json.completedAt ? new Date(json.completedAt) : null,
      json.dueDate ? new Date(json.dueDate) : null
    );
  }
}
