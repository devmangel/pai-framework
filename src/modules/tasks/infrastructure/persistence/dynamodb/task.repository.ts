import { Injectable } from '@nestjs/common';
import { DynamoDBClient, PutItemCommand, GetItemCommand, QueryCommand, DeleteItemCommand, ScanCommand } from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { Task } from '../../../domain/entities/task.entity';
import { TaskStatus } from '../../../domain/enums/task-status.enum';
import { TaskPriority } from '../../../domain/enums/task-priority.enum';
import { TaskRepository } from '../../../domain/ports/task.repository';

@Injectable()
export class DynamoDBTaskRepository implements TaskRepository {
  private readonly tableName = 'Tasks';

  constructor(private readonly dynamoDBClient: DynamoDBClient) {}

  async save(task: Task): Promise<void> {
    const item = this.toItem(task);
    
    try {
      await this.dynamoDBClient.send(
        new PutItemCommand({
          TableName: this.tableName,
          Item: marshall(item, { removeUndefinedValues: true }),
        })
      );
    } catch (error) {
      throw new Error(`Error saving task: ${error.message}`);
    }
  }

  async findById(id: string): Promise<Task | null> {
    try {
      const result = await this.dynamoDBClient.send(
        new GetItemCommand({
          TableName: this.tableName,
          Key: marshall({ id }, { removeUndefinedValues: true }),
        })
      );

      if (!result.Item) {
        return null;
      }

      return this.toEntity(unmarshall(result.Item));
    } catch (error) {
      throw new Error(`Error finding task: ${error.message}`);
    }
  }

  async findAll(): Promise<Task[]> {
    try {
      const result = await this.dynamoDBClient.send(
        new ScanCommand({
          TableName: this.tableName,
        })
      );

      return (result.Items || []).map(item => this.toEntity(unmarshall(item)));
    } catch (error) {
      throw new Error(`Error finding all tasks: ${error.message}`);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.dynamoDBClient.send(
        new DeleteItemCommand({
          TableName: this.tableName,
          Key: marshall({ id }, { removeUndefinedValues: true }),
        })
      );
    } catch (error) {
      throw new Error(`Error deleting task: ${error.message}`);
    }
  }

  async findByStatus(status: TaskStatus): Promise<Task[]> {
    try {
      const result = await this.dynamoDBClient.send(
        new QueryCommand({
          TableName: this.tableName,
          IndexName: 'StatusIndex',
          KeyConditionExpression: '#status = :status',
          ExpressionAttributeNames: {
            '#status': 'status',
          },
          ExpressionAttributeValues: marshall({
            ':status': status,
          }, { removeUndefinedValues: true }),
        })
      );

      return (result.Items || []).map(item => this.toEntity(unmarshall(item)));
    } catch (error) {
      throw new Error(`Error finding tasks by status: ${error.message}`);
    }
  }

  async findByPriority(priority: TaskPriority): Promise<Task[]> {
    try {
      const result = await this.dynamoDBClient.send(
        new QueryCommand({
          TableName: this.tableName,
          IndexName: 'PriorityIndex',
          KeyConditionExpression: 'priority = :priority',
          ExpressionAttributeValues: marshall({
            ':priority': priority,
          }, { removeUndefinedValues: true }),
        })
      );

      return (result.Items || []).map(item => this.toEntity(unmarshall(item)));
    } catch (error) {
      throw new Error(`Error finding tasks by priority: ${error.message}`);
    }
  }

  async findByAgent(agentId: string): Promise<Task[]> {
    try {
      const result = await this.dynamoDBClient.send(
        new QueryCommand({
          TableName: this.tableName,
          IndexName: 'AgentIndex',
          KeyConditionExpression: 'assignedTo = :agentId',
          ExpressionAttributeValues: marshall({
            ':agentId': agentId,
          }, { removeUndefinedValues: true }),
        })
      );

      return (result.Items || []).map(item => this.toEntity(unmarshall(item)));
    } catch (error) {
      throw new Error(`Error finding tasks by agent: ${error.message}`);
    }
  }

  async findByParent(parentId: string): Promise<Task[]> {
    try {
      const result = await this.dynamoDBClient.send(
        new QueryCommand({
          TableName: this.tableName,
          IndexName: 'ParentIndex',
          KeyConditionExpression: 'parentId = :parentId',
          ExpressionAttributeValues: marshall({
            ':parentId': parentId,
          }, { removeUndefinedValues: true }),
        })
      );

      return (result.Items || []).map(item => this.toEntity(unmarshall(item)));
    } catch (error) {
      throw new Error(`Error finding tasks by parent: ${error.message}`);
    }
  }

  async findDependencies(taskId: string): Promise<Task[]> {
    const task = await this.findById(taskId);
    if (!task) {
      return [];
    }

    const dependencies = task.getDependencies();
    const tasks = await Promise.all(
      dependencies.map(depId => this.findById(depId))
    );

    return tasks.filter((t): t is Task => t !== null);
  }

  async findDependents(taskId: string): Promise<Task[]> {
    try {
      const result = await this.dynamoDBClient.send(
        new ScanCommand({
          TableName: this.tableName,
          FilterExpression: 'contains(dependencies, :taskId)',
          ExpressionAttributeValues: marshall({
            ':taskId': taskId,
          }, { removeUndefinedValues: true }),
        })
      );

      return (result.Items || []).map(item => this.toEntity(unmarshall(item)));
    } catch (error) {
      throw new Error(`Error finding task dependents: ${error.message}`);
    }
  }

  async findBlocked(): Promise<Task[]> {
    return this.findByStatus(TaskStatus.BLOCKED);
  }

  async findOverdue(): Promise<Task[]> {
    try {
      const now = new Date().toISOString();
      const result = await this.dynamoDBClient.send(
        new ScanCommand({
          TableName: this.tableName,
          FilterExpression: 'dueDate < :now AND #status <> :completed',
          ExpressionAttributeNames: {
            '#status': 'status',
          },
          ExpressionAttributeValues: marshall({
            ':now': now,
            ':completed': TaskStatus.COMPLETED,
          }, { removeUndefinedValues: true }),
        })
      );

      return (result.Items || []).map(item => this.toEntity(unmarshall(item)));
    } catch (error) {
      throw new Error(`Error finding overdue tasks: ${error.message}`);
    }
  }

  async exists(id: string): Promise<boolean> {
    const task = await this.findById(id);
    return task !== null;
  }

  async saveMany(tasks: Task[]): Promise<void> {
    await Promise.all(tasks.map(task => this.save(task)));
  }

  async deleteMany(ids: string[]): Promise<void> {
    await Promise.all(ids.map(id => this.delete(id)));
  }

  private toItem(task: Task): Record<string, any> {
    return {
      id: task.getId(),
      title: task.getTitle(),
      description: task.getDescription(),
      status: task.getStatus(),
      priority: task.getPriority(),
      assignedTo: task.getAssignedAgent()?.getId(),
      parentId: task.getParentId(),
      dependencies: task.getDependencies(),
      metadata: task.getMetadata(),
      result: task.getResult()?.toJSON(),
      createdAt: task.getCreatedAt().toISOString(),
      updatedAt: task.getUpdatedAt().toISOString(),
      startedAt: task.getStartedAt()?.toISOString(),
      completedAt: task.getCompletedAt()?.toISOString(),
      dueDate: task.getDueDate()?.toISOString(),
    };
  }

  private toEntity(item: Record<string, any>): Task {
    // Note: This is a placeholder. You'll need to implement the actual Task entity constructor
    return Task.fromJSON(item);
  }
}
