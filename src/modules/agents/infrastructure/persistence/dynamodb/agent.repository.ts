import { Injectable } from '@nestjs/common';
import { DynamoDBClient, PutItemCommand, GetItemCommand, QueryCommand, DeleteItemCommand, ScanCommand } from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { Agent } from '../../../domain/entities/agent.entity';
import { AgentId } from '../../../domain/value-objects/agent-id.vo';
import { AgentRole } from '../../../domain/value-objects/agent-role.vo';
import { AgentCapability, CapabilityType, ParameterType } from '../../../domain/value-objects/agent-capability.vo';
import { AgentRepository, AgentNotFoundError, DuplicateAgentError } from '../../../domain/ports/agent.repository';

@Injectable()
export class DynamoDBAgentRepository implements AgentRepository {
  private readonly tableName = 'Agents';

  constructor(private readonly dynamoDBClient: DynamoDBClient) {}

  async save(agent: Agent): Promise<void> {
    const item = this.toItem(agent);
    
    try {
      await this.dynamoDBClient.send(
        new PutItemCommand({
          TableName: this.tableName,
          Item: marshall(item, { removeUndefinedValues: true }),
          ConditionExpression: 'attribute_not_exists(id)',
        })
      );
    } catch (error) {
      if (error.name === 'ConditionalCheckFailedException') {
        throw new DuplicateAgentError(agent.getName());
      }
      throw error;
    }
  }

  async findById(id: AgentId): Promise<Agent | null> {
    const result = await this.dynamoDBClient.send(
      new GetItemCommand({
        TableName: this.tableName,
        Key: marshall({ id: id.toString() }, { removeUndefinedValues: true }),
      })
    );

    if (!result.Item) {
      return null;
    }

    return this.toEntity(unmarshall(result.Item));
  }

  async findAll(): Promise<Agent[]> {
    const result = await this.dynamoDBClient.send(
      new ScanCommand({
        TableName: this.tableName,
      })
    );

    return (result.Items || []).map(item => this.toEntity(unmarshall(item)));
  }

  async findByName(name: string): Promise<Agent[]> {
    const result = await this.dynamoDBClient.send(
      new QueryCommand({
        TableName: this.tableName,
        IndexName: 'NameIndex',
        KeyConditionExpression: '#name = :name',
        ExpressionAttributeNames: {
          '#name': 'name',
        },
        ExpressionAttributeValues: marshall({
          ':name': name,
        }, { removeUndefinedValues: true }),
      })
    );

    return (result.Items || []).map(item => this.toEntity(unmarshall(item)));
  }

  async update(agent: Agent): Promise<void> {
    const item = this.toItem(agent);

    try {
      await this.dynamoDBClient.send(
        new PutItemCommand({
          TableName: this.tableName,
          Item: marshall(item, { removeUndefinedValues: true }),
          ConditionExpression: 'attribute_exists(id)',
        })
      );
    } catch (error) {
      if (error.name === 'ConditionalCheckFailedException') {
        throw new AgentNotFoundError(agent.getId().toString());
      }
      throw error;
    }
  }

  async delete(id: AgentId): Promise<void> {
    try {
      await this.dynamoDBClient.send(
        new DeleteItemCommand({
          TableName: this.tableName,
          Key: marshall({ id: id.toString() }, { removeUndefinedValues: true }),
          ConditionExpression: 'attribute_exists(id)',
        })
      );
    } catch (error) {
      if (error.name === 'ConditionalCheckFailedException') {
        throw new AgentNotFoundError(id.toString());
      }
      throw error;
    }
  }

  async findByTeamId(teamId: string): Promise<Agent[]> {
    const result = await this.dynamoDBClient.send(
      new QueryCommand({
        TableName: this.tableName,
        IndexName: 'TeamIndex',
        KeyConditionExpression: 'teamId = :teamId',
        ExpressionAttributeValues: marshall({
          ':teamId': teamId,
        }, { removeUndefinedValues: true }),
      })
    );

    return (result.Items || []).map(item => this.toEntity(unmarshall(item)));
  }

  async findByCapability(capabilityName: string): Promise<Agent[]> {
    // Note: This is a scan operation with a filter, which isn't ideal for production.
    // Consider creating a GSI for capabilities if this query is frequently used.
    const result = await this.dynamoDBClient.send(
      new ScanCommand({
        TableName: this.tableName,
        FilterExpression: 'contains(capabilities, :capabilityName)',
        ExpressionAttributeValues: marshall({
          ':capabilityName': capabilityName,
        }, { removeUndefinedValues: true }),
      })
    );

    return (result.Items || []).map(item => this.toEntity(unmarshall(item)));
  }

  async findByRole(roleName: string): Promise<Agent[]> {
    const result = await this.dynamoDBClient.send(
      new QueryCommand({
        TableName: this.tableName,
        IndexName: 'RoleIndex',
        KeyConditionExpression: 'roleName = :roleName',
        ExpressionAttributeValues: marshall({
          ':roleName': roleName,
        }, { removeUndefinedValues: true }),
      })
    );

    return (result.Items || []).map(item => this.toEntity(unmarshall(item)));
  }

  async findAvailableAgents(): Promise<Agent[]> {
    const result = await this.dynamoDBClient.send(
      new QueryCommand({
        TableName: this.tableName,
        IndexName: 'StatusIndex',
        KeyConditionExpression: '#status = :status',
        ExpressionAttributeNames: {
          '#status': 'status',
        },
        ExpressionAttributeValues: marshall({
          ':status': 'AVAILABLE',
        }, { removeUndefinedValues: true }),
      })
    );

    return (result.Items || []).map(item => this.toEntity(unmarshall(item)));
  }

  async findBusyAgents(): Promise<Agent[]> {
    const result = await this.dynamoDBClient.send(
      new QueryCommand({
        TableName: this.tableName,
        IndexName: 'StatusIndex',
        KeyConditionExpression: '#status = :status',
        ExpressionAttributeNames: {
          '#status': 'status',
        },
        ExpressionAttributeValues: marshall({
          ':status': 'BUSY',
        }, { removeUndefinedValues: true }),
      })
    );

    return (result.Items || []).map(item => this.toEntity(unmarshall(item)));
  }

  async findByExpertise(expertise: string[]): Promise<Agent[]> {
    // Note: This is a scan operation with a filter, consider optimizing if used frequently
    const result = await this.dynamoDBClient.send(
      new ScanCommand({
        TableName: this.tableName,
        FilterExpression: 'expertise IN (:expertise)',
        ExpressionAttributeValues: marshall({
          ':expertise': expertise,
        }, { removeUndefinedValues: true }),
      })
    );

    return (result.Items || []).map(item => this.toEntity(unmarshall(item)));
  }

  async findByGoals(goals: string[]): Promise<Agent[]> {
    // Note: This is a scan operation with a filter, consider optimizing if used frequently
    const result = await this.dynamoDBClient.send(
      new ScanCommand({
        TableName: this.tableName,
        FilterExpression: 'goals IN (:goals)',
        ExpressionAttributeValues: marshall({
          ':goals': goals,
        }, { removeUndefinedValues: true }),
      })
    );

    return (result.Items || []).map(item => this.toEntity(unmarshall(item)));
  }

  async saveMany(agents: Agent[]): Promise<void> {
    // TODO: Implement batch write operation
    await Promise.all(agents.map(agent => this.save(agent)));
  }

  async deleteMany(ids: AgentId[]): Promise<void> {
    // TODO: Implement batch delete operation
    await Promise.all(ids.map(id => this.delete(id)));
  }

  private toItem(agent: Agent): Record<string, any> {
    return {
      id: agent.getId().toString(),
      name: agent.getName(),
      role: agent.getRole().toJSON(),
      capabilities: agent.getCapabilities().map(cap => cap.toJSON()),
      description: agent.getDescription(),
      goals: agent.getGoals(),
      memory: agent.getMemory(),
      createdAt: agent.getCreatedAt(),
      updatedAt: agent.getUpdatedAt(),
    };
  }

  private toEntity(item: Record<string, any>): Agent {
    const role = new AgentRole(
      item.role.name,
      item.role.description,
      item.role.responsibilities
    );

    const capabilities = item.capabilities.map((cap: any) => 
      new AgentCapability(
        cap.name,
        cap.description,
        CapabilityType[cap.type as keyof typeof CapabilityType],
        cap.parameters.map((param: any) => ({
          name: param.name,
          type: ParameterType[param.type as keyof typeof ParameterType],
          description: param.description,
          required: param.required,
          defaultValue: param.defaultValue,
        }))
      )
    );

    return new Agent(
      new AgentId(item.id),
      item.name,
      role,
      capabilities,
      item.description,
      item.goals,
      item.memory,
      item.createdAt,
      item.updatedAt
    );
  }
}
