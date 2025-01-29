import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { 
  DynamoDBClient,
  QueryCommand,
  PutItemCommand,
  GetItemCommand,
  DeleteItemCommand,
  ScanCommand,
  UpdateItemCommand,
  BatchWriteItemCommand,
} from '@aws-sdk/client-dynamodb';
import { 
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  QueryCommand as DocQueryCommand,
  ScanCommand as DocScanCommand,
  DeleteCommand,
  UpdateCommand,
  BatchWriteCommand,
} from '@aws-sdk/lib-dynamodb';
import { TaskRepository } from '../../domain/ports/task.repository';
import { Task } from '../../domain/entities/task.entity';
import { TaskStatus } from '../../domain/enums/task-status.enum';
import { TaskPriority } from '../../domain/enums/task-priority.enum';
import { TaskResult } from '../../domain/value-objects/task-result.vo';

@Injectable()
export class DynamoDBTaskRepository implements TaskRepository {
  private readonly docClient: DynamoDBDocumentClient;
  private readonly tableName: string;
  private readonly gsi1Name = 'GSI1'; // For queries by status
  private readonly gsi2Name = 'GSI2'; // For queries by priority
  private readonly gsi3Name = 'GSI3'; // For queries by agent

  constructor(private readonly configService: ConfigService) {
    const client = new DynamoDBClient({
      region: this.configService.get<string>('AWS_REGION'),
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY'),
      },
    });

    this.docClient = DynamoDBDocumentClient.from(client);
    this.tableName = this.configService.get<string>('DYNAMODB_TASKS_TABLE');
  }

  async create(task: Task): Promise<Task> {
    const item = this.toItem(task);
    await this.docClient.send(
      new PutCommand({
        TableName: this.tableName,
        Item: item,
      })
    );
    return task;
  }

  async findById(id: string): Promise<Task | null> {
    const result = await this.docClient.send(
      new GetCommand({
        TableName: this.tableName,
        Key: { id },
      })
    );

    return result.Item ? this.toEntity(result.Item) : null;
  }

  async findAll(filters?: {
    status?: TaskStatus;
    priority?: TaskPriority;
    agentId?: string;
    parentId?: string;
  }): Promise<Task[]> {
    let command: DocQueryCommand | DocScanCommand;

    if (filters?.status) {
      command = new DocQueryCommand({
        TableName: this.tableName,
        IndexName: this.gsi1Name,
        KeyConditionExpression: 'status = :status',
        ExpressionAttributeValues: {
          ':status': filters.status,
        },
      });
    } else if (filters?.priority) {
      command = new DocQueryCommand({
        TableName: this.tableName,
        IndexName: this.gsi2Name,
        KeyConditionExpression: 'priority = :priority',
        ExpressionAttributeValues: {
          ':priority': filters.priority,
        },
      });
    } else if (filters?.agentId) {
      command = new DocQueryCommand({
        TableName: this.tableName,
        IndexName: this.gsi3Name,
        KeyConditionExpression: 'assignedTo = :agentId',
        ExpressionAttributeValues: {
          ':agentId': filters.agentId,
        },
      });
    } else {
      command = new DocScanCommand({
        TableName: this.tableName,
      });
    }

    if (filters?.parentId) {
      command.input.FilterExpression = 'parentId = :parentId';
      command.input.ExpressionAttributeValues = {
        ...command.input.ExpressionAttributeValues,
        ':parentId': filters.parentId,
      };
    }

    const result = await this.docClient.send(command);
    return (result.Items || []).map(item => this.toEntity(item));
  }

  async update(task: Task): Promise<Task> {
    const item = this.toItem(task);
    await this.docClient.send(
      new PutCommand({
        TableName: this.tableName,
        Item: item,
      })
    );
    return task;
  }

  async delete(id: string): Promise<void> {
    await this.docClient.send(
      new DeleteCommand({
        TableName: this.tableName,
        Key: { id },
      })
    );
  }

  async findByStatus(status: TaskStatus): Promise<Task[]> {
    const result = await this.docClient.send(
      new DocQueryCommand({
        TableName: this.tableName,
        IndexName: this.gsi1Name,
        KeyConditionExpression: 'status = :status',
        ExpressionAttributeValues: {
          ':status': status,
        },
      })
    );

    return (result.Items || []).map(item => this.toEntity(item));
  }

  async findByPriority(priority: TaskPriority): Promise<Task[]> {
    const result = await this.docClient.send(
      new DocQueryCommand({
        TableName: this.tableName,
        IndexName: this.gsi2Name,
        KeyConditionExpression: 'priority = :priority',
        ExpressionAttributeValues: {
          ':priority': priority,
        },
      })
    );

    return (result.Items || []).map(item => this.toEntity(item));
  }

  async findByAgent(agentId: string): Promise<Task[]> {
    const result = await this.docClient.send(
      new DocQueryCommand({
        TableName: this.tableName,
        IndexName: this.gsi3Name,
        KeyConditionExpression: 'assignedTo = :agentId',
        ExpressionAttributeValues: {
          ':agentId': agentId,
        },
      })
    );

    return (result.Items || []).map(item => this.toEntity(item));
  }

  async findChildren(parentId: string): Promise<Task[]> {
    const result = await this.docClient.send(
      new DocQueryCommand({
        TableName: this.tableName,
        FilterExpression: 'parentId = :parentId',
        ExpressionAttributeValues: {
          ':parentId': parentId,
        },
      })
    );

    return (result.Items || []).map(item => this.toEntity(item));
  }

  async findBlocked(): Promise<Task[]> {
    return this.findByStatus(TaskStatus.BLOCKED);
  }

  async findOverdue(): Promise<Task[]> {
    const result = await this.docClient.send(
      new DocScanCommand({
        TableName: this.tableName,
        FilterExpression: 'dueDate < :now AND status <> :completed',
        ExpressionAttributeValues: {
          ':now': new Date().toISOString(),
          ':completed': TaskStatus.COMPLETED,
        },
      })
    );

    return (result.Items || []).map(item => this.toEntity(item));
  }

  async createMany(tasks: Task[]): Promise<Task[]> {
    const writeRequests = tasks.map(task => ({
      PutRequest: {
        Item: this.toItem(task),
      },
    }));

    // DynamoDB batch write has a limit of 25 items
    const chunks = this.chunkArray(writeRequests, 25);
    for (const chunk of chunks) {
      await this.docClient.send(
        new BatchWriteCommand({
          RequestItems: {
            [this.tableName]: chunk,
          },
        })
      );
    }

    return tasks;
  }

  async updateMany(tasks: Task[]): Promise<Task[]> {
    return this.createMany(tasks); // DynamoDB put operation handles both create and update
  }

  async deleteMany(ids: string[]): Promise<void> {
    const writeRequests = ids.map(id => ({
      DeleteRequest: {
        Key: { id },
      },
    }));

    const chunks = this.chunkArray(writeRequests, 25);
    for (const chunk of chunks) {
      await this.docClient.send(
        new BatchWriteCommand({
          RequestItems: {
            [this.tableName]: chunk,
          },
        })
      );
    }
  }

  async addDependency(taskId: string, dependencyId: string): Promise<void> {
    await this.docClient.send(
      new UpdateCommand({
        TableName: this.tableName,
        Key: { id: taskId },
        UpdateExpression: 'ADD dependencies :dependencyId',
        ExpressionAttributeValues: {
          ':dependencyId': new Set([dependencyId]),
        },
      })
    );
  }

  async removeDependency(taskId: string, dependencyId: string): Promise<void> {
    await this.docClient.send(
      new UpdateCommand({
        TableName: this.tableName,
        Key: { id: taskId },
        UpdateExpression: 'DELETE dependencies :dependencyId',
        ExpressionAttributeValues: {
          ':dependencyId': new Set([dependencyId]),
        },
      })
    );
  }

  async getDependencies(taskId: string): Promise<Task[]> {
    const task = await this.findById(taskId);
    if (!task) return [];

    const dependencies = task.getDependencies();
    const tasks = await Promise.all(
      dependencies.map(depId => this.findById(depId)),
    );

    return tasks.filter((t): t is Task => t !== null);
  }

  async getDependents(taskId: string): Promise<Task[]> {
    const result = await this.docClient.send(
      new DocScanCommand({
        TableName: this.tableName,
        FilterExpression: 'contains(dependencies, :taskId)',
        ExpressionAttributeValues: {
          ':taskId': taskId,
        },
      })
    );

    return (result.Items || []).map(item => this.toEntity(item));
  }

  async countByStatus(): Promise<Record<TaskStatus, number>> {
    const counts: Record<TaskStatus, number> = {
      [TaskStatus.PENDING]: 0,
      [TaskStatus.IN_PROGRESS]: 0,
      [TaskStatus.BLOCKED]: 0,
      [TaskStatus.COMPLETED]: 0,
      [TaskStatus.FAILED]: 0,
      [TaskStatus.CANCELLED]: 0,
    };

    const tasks = await this.findAll();
    tasks.forEach(task => {
      counts[task.getStatus()]++;
    });

    return counts;
  }

  async countByPriority(): Promise<Record<TaskPriority, number>> {
    const counts: Record<TaskPriority, number> = {
      [TaskPriority.LOW]: 0,
      [TaskPriority.MEDIUM]: 0,
      [TaskPriority.HIGH]: 0,
      [TaskPriority.CRITICAL]: 0,
    };

    const tasks = await this.findAll();
    tasks.forEach(task => {
      counts[task.getPriority()]++;
    });

    return counts;
  }

  async countByAgent(): Promise<Record<string, number>> {
    const counts: Record<string, number> = {};
    const tasks = await this.findAll();

    tasks.forEach(task => {
      const agentId = task.getAssignedAgent()?.getId();
      if (agentId && typeof agentId === 'string') {
        counts[agentId] = (counts[agentId] || 0) + 1;
      }
    });

    return counts;
  }

  private toItem(task: Task): Record<string, any> {
    return {
      ...task.toJSON(),
      type: 'TASK', // For DynamoDB entity type discrimination
    };
  }

  private toEntity(item: Record<string, any>): Task {
    return new Task(
      item.id,
      item.title,
      item.description,
      item.status,
      item.priority,
      item.assignedTo, // This needs proper Agent entity conversion
      item.result ? new TaskResult(
        item.result.content,
        item.result.success,
        item.result.error,
        item.result.metadata,
        new Date(item.result.timestamp),
      ) : undefined,
      new Date(item.createdAt),
      new Date(item.updatedAt),
      item.completedAt ? new Date(item.completedAt) : undefined,
      item.parentId,
      item.dependencies || [],
      item.metadata || {},
    );
  }

  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
}
