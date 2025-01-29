import { Injectable } from '@nestjs/common';
import { DynamoDBClient, PutItemCommand, GetItemCommand, QueryCommand, DeleteItemCommand, ScanCommand, BatchWriteItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { Task } from '../../../domain/entities/task.entity';
import { TaskStatus } from '../../../domain/enums/task-status.enum';
import { TaskPriority } from '../../../domain/enums/task-priority.enum';
import { TaskRepository } from '../../../domain/ports/task.repository';

@Injectable()
export class DynamoDBTaskRepository implements TaskRepository {
  private readonly tableName = 'Tasks';

  constructor(private readonly dynamoDBClient: DynamoDBClient) {}

  async create(task: Task): Promise<Task> {
    await this.save(task);
    return task;
  }

  async update(task: Task): Promise<Task> {
    await this.save(task);
    return task;
  }

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

  async findAll(filters?: {
    status?: TaskStatus;
    priority?: TaskPriority;
    agentId?: string;
    parentId?: string;
  }): Promise<Task[]> {
    try {
      let command: QueryCommand | ScanCommand;
      let expressionAttributeValues: any = {};
      let expressionAttributeNames: any = {};
      let filterExpressions: string[] = [];

      if (filters?.status) {
        command = new QueryCommand({
          TableName: this.tableName,
          IndexName: 'StatusIndex',
          KeyConditionExpression: '#status = :status',
          ExpressionAttributeNames: { '#status': 'status' },
          ExpressionAttributeValues: marshall({ ':status': filters.status }),
        });
      } else if (filters?.priority) {
        command = new QueryCommand({
          TableName: this.tableName,
          IndexName: 'PriorityIndex',
          KeyConditionExpression: 'priority = :priority',
          ExpressionAttributeValues: marshall({ ':priority': filters.priority }),
        });
      } else if (filters?.agentId) {
        command = new QueryCommand({
          TableName: this.tableName,
          IndexName: 'AgentIndex',
          KeyConditionExpression: 'assignedTo = :agentId',
          ExpressionAttributeValues: marshall({ ':agentId': filters.agentId }),
        });
      } else {
        command = new ScanCommand({ TableName: this.tableName });
      }

      if (filters?.parentId) {
        filterExpressions.push('parentId = :parentId');
        expressionAttributeValues[':parentId'] = filters.parentId;
      }

      if (filterExpressions.length > 0) {
        command.input.FilterExpression = filterExpressions.join(' AND ');
        command.input.ExpressionAttributeValues = marshall(expressionAttributeValues);
      }

      const result = await this.dynamoDBClient.send(command);
      return (result.Items || []).map(item => this.toEntity(unmarshall(item)));
    } catch (error) {
      throw new Error(`Error finding tasks: ${error.message}`);
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
    return this.findAll({ status });
  }

  async findByPriority(priority: TaskPriority): Promise<Task[]> {
    return this.findAll({ priority });
  }

  async findByAgent(agentId: string): Promise<Task[]> {
    return this.findAll({ agentId });
  }

  async findByParent(parentId: string): Promise<Task[]> {
    return this.findAll({ parentId });
  }

  async addDependency(taskId: string, dependencyId: string): Promise<void> {
    try {
      await this.dynamoDBClient.send(
        new PutItemCommand({
          TableName: this.tableName,
          Item: marshall({
            id: taskId,
            dependencies: [dependencyId],
          }, { removeUndefinedValues: true }),
        })
      );
    } catch (error) {
      throw new Error(`Error adding dependency: ${error.message}`);
    }
  }

  async removeDependency(taskId: string, dependencyId: string): Promise<void> {
    const task = await this.findById(taskId);
    if (!task) return;

    const dependencies = task.getDependencies().filter(id => id !== dependencyId);
    const updatedTask = task as any;
    updatedTask.dependencies = dependencies;
    await this.save(task);
  }

  async findDependencies(taskId: string): Promise<Task[]> {
    const task = await this.findById(taskId);
    if (!task) return [];

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

  async createMany(tasks: Task[]): Promise<Task[]> {
    const chunks = this.chunkArray(tasks, 25); // DynamoDB batch write limit
    for (const chunk of chunks) {
      const writeRequests = chunk.map(task => ({
        PutRequest: {
          Item: marshall(this.toItem(task), { removeUndefinedValues: true }),
        },
      }));

      await this.dynamoDBClient.send(
        new BatchWriteItemCommand({
          RequestItems: {
            [this.tableName]: writeRequests,
          },
        })
      );
    }
    return tasks;
  }

  async updateMany(tasks: Task[]): Promise<Task[]> {
    return this.createMany(tasks); // DynamoDB PutItem handles both create and update
  }

  async saveMany(tasks: Task[]): Promise<void> {
    await this.createMany(tasks);
  }

  async deleteMany(ids: string[]): Promise<void> {
    const chunks = this.chunkArray(ids, 25);
    for (const chunk of chunks) {
      const writeRequests = chunk.map(id => ({
        DeleteRequest: {
          Key: marshall({ id }, { removeUndefinedValues: true }),
        },
      }));

      await this.dynamoDBClient.send(
        new BatchWriteItemCommand({
          RequestItems: {
            [this.tableName]: writeRequests,
          },
        })
      );
    }
  }

  async countByStatus(): Promise<Record<TaskStatus, number>> {
    const tasks = await this.findAll();
    const counts: Record<TaskStatus, number> = {
      [TaskStatus.PENDING]: 0,
      [TaskStatus.IN_PROGRESS]: 0,
      [TaskStatus.COMPLETED]: 0,
      [TaskStatus.FAILED]: 0,
      [TaskStatus.BLOCKED]: 0,
      [TaskStatus.CANCELLED]: 0,
    };

    tasks.forEach(task => {
      counts[task.getStatus()]++;
    });

    return counts;
  }

  async countByPriority(): Promise<Record<TaskPriority, number>> {
    const tasks = await this.findAll();
    const counts: Record<TaskPriority, number> = {
      [TaskPriority.LOW]: 0,
      [TaskPriority.MEDIUM]: 0,
      [TaskPriority.HIGH]: 0,
      [TaskPriority.CRITICAL]: 0,
    };

    tasks.forEach(task => {
      counts[task.getPriority()]++;
    });

    return counts;
  }

  async countByAgent(): Promise<Record<string, number>> {
    const tasks = await this.findAll();
    const counts: Record<string, number> = {};

    tasks.forEach(task => {
      const agent = task.getAssignedAgent();
      if (agent) {
        const agentId = agent.getId();
        if (typeof agentId === 'string') {
          counts[agentId] = (counts[agentId] || 0) + 1;
        }
      }
    });

    return counts;
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
    return Task.fromJSON(item);
  }

  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  // Alias methods to match interface
  async getDependencies(taskId: string): Promise<Task[]> {
    return this.findDependencies(taskId);
  }

  async getDependents(taskId: string): Promise<Task[]> {
    return this.findDependents(taskId);
  }
}
