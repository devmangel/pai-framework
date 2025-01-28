import { Agent } from '../../../agents/domain/entities/agent.entity';
import { TaskStatus } from '../enums/task-status.enum';
import { TaskPriority } from '../enums/task-priority.enum';
import { TaskResult } from '../value-objects/task-result.vo';

export class Task {
  constructor(
    private readonly id: string,
    private title: string,
    private description: string,
    private status: TaskStatus,
    private priority: TaskPriority,
    private assignedTo?: Agent,
    private result?: TaskResult,
    private readonly createdAt: Date = new Date(),
    private updatedAt: Date = new Date(),
    private completedAt?: Date,
    private readonly parentId?: string,
    private dependencies: string[] = [],
    private metadata: Record<string, any> = {},
  ) {
    this.validate();
  }

  public validate(): void {
    if (!this.id || typeof this.id !== 'string') {
      throw new Error('Task ID must be a non-empty string');
    }
    if (!this.title || typeof this.title !== 'string') {
      throw new Error('Task title must be a non-empty string');
    }
    if (!Object.values(TaskStatus).includes(this.status)) {
      throw new Error('Invalid task status');
    }
    if (!Object.values(TaskPriority).includes(this.priority)) {
      throw new Error('Invalid task priority');
    }
  }

  // Getters
  public getId(): string {
    return this.id;
  }

  public getTitle(): string {
    return this.title;
  }

  public getDescription(): string {
    return this.description;
  }

  public getStatus(): TaskStatus {
    return this.status;
  }

  public getPriority(): TaskPriority {
    return this.priority;
  }

  public getAssignedAgent(): Agent | undefined {
    return this.assignedTo;
  }

  public getResult(): TaskResult | undefined {
    return this.result;
  }

  public getCreatedAt(): Date {
    return this.createdAt;
  }

  public getUpdatedAt(): Date {
    return this.updatedAt;
  }

  public getCompletedAt(): Date | undefined {
    return this.completedAt;
  }

  public getParentId(): string | undefined {
    return this.parentId;
  }

  public getDependencies(): string[] {
    return [...this.dependencies];
  }

  public getMetadata(): Record<string, any> {
    return { ...this.metadata };
  }

  // Setters and state changes
  public updateTitle(title: string): void {
    if (!title || typeof title !== 'string') {
      throw new Error('Task title must be a non-empty string');
    }
    this.title = title;
    this.updatedAt = new Date();
  }

  public updateDescription(description: string): void {
    this.description = description;
    this.updatedAt = new Date();
  }

  public updateStatus(status: TaskStatus): void {
    this.status = status;
    this.updatedAt = new Date();
    
    if (status === TaskStatus.COMPLETED) {
      this.completedAt = new Date();
    }
  }

  public updatePriority(priority: TaskPriority): void {
    this.priority = priority;
    this.updatedAt = new Date();
  }

  public assignTo(agent: Agent): void {
    this.assignedTo = agent;
    this.updatedAt = new Date();
  }

  public unassign(): void {
    this.assignedTo = undefined;
    this.updatedAt = new Date();
  }

  public setResult(result: TaskResult): void {
    this.result = result;
    this.updatedAt = new Date();
  }

  public updateMetadata(metadata: Record<string, any>): void {
    this.metadata = { ...this.metadata, ...metadata };
    this.updatedAt = new Date();
  }

  // Business logic
  public isAssigned(): boolean {
    return !!this.assignedTo;
  }

  public isCompleted(): boolean {
    return this.status === TaskStatus.COMPLETED;
  }

  public isInProgress(): boolean {
    return this.status === TaskStatus.IN_PROGRESS;
  }

  public hasResult(): boolean {
    return !!this.result;
  }

  public hasDependencies(): boolean {
    return this.dependencies.length > 0;
  }

  public isBlocked(): boolean {
    return this.status === TaskStatus.BLOCKED;
  }

  public isHighPriority(): boolean {
    return this.priority === TaskPriority.HIGH;
  }

  public toJSON() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      status: this.status,
      priority: this.priority,
      assignedTo: this.assignedTo?.toJSON(),
      result: this.result?.toJSON(),
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      completedAt: this.completedAt,
      parentId: this.parentId,
      dependencies: this.dependencies,
      metadata: this.metadata,
    };
  }
}
