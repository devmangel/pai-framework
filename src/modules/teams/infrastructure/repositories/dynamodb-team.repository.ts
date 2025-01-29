import { Injectable } from '@nestjs/common';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { 
  DynamoDBDocumentClient, 
  GetCommand, 
  PutCommand, 
  ScanCommand, 
  DeleteCommand,
  QueryCommand
} from '@aws-sdk/lib-dynamodb';
import { Team } from '../../domain/entities/team.entity';
import { TeamRepository } from '../../domain/ports/team.repository';
import { TeamMember } from '../../domain/value-objects/team-member.vo';
import { TeamRole } from '../../domain/enums/team-role.enum';
import { TeamChannel, TeamChannelMessage } from '../../domain/value-objects/team-channel.vo';
import { ConfigService } from '@nestjs/config';

interface DynamoDBTeamMember {
  agentId: string;
  role: string;
  joinedAt: string;
}

interface DynamoDBTeamChannelMessage {
  id: string;
  content: string;
  senderId: string;
  createdAt: string;
  metadata: Record<string, any>;
}

interface DynamoDBTeamChannel {
  id: string;
  name: string;
  description: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  members: DynamoDBTeamMember[];
  messages: DynamoDBTeamChannelMessage[];
}

interface DynamoDBTeam {
  id: string;
  name: string;
  description: string;
  members: DynamoDBTeamMember[];
  channels: DynamoDBTeamChannel[];
  createdAt: string;
  updatedAt: string;
}

@Injectable()
export class DynamoDBTeamRepository implements TeamRepository {
  private readonly tableName: string;
  private readonly docClient: DynamoDBDocumentClient;

  constructor(private configService: ConfigService) {
    const client = new DynamoDBClient({
      region: this.configService.get<string>('AWS_REGION', 'us-west-2'),
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID', ''),
        secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY', ''),
      },
    });

    this.docClient = DynamoDBDocumentClient.from(client);
    this.tableName = this.configService.get<string>('DYNAMODB_TEAMS_TABLE', 'Teams');
  }

  private toEntity(item: DynamoDBTeam): Team {
    const members = item.members.map(
      (m) =>
        new TeamMember(
          m.agentId,
          TeamRole[m.role as keyof typeof TeamRole],
          new Date(m.joinedAt)
        )
    );

    const channels = item.channels.map((c) => {
      const channelMembers = c.members.map(
        (m) =>
          new TeamMember(
            m.agentId,
            TeamRole[m.role as keyof typeof TeamRole],
            new Date(m.joinedAt)
          )
      );

      const channel = TeamChannel.create(
        c.id,
        c.name,
        c.description,
        c.createdBy,
        channelMembers
      );

      // Reconstruct dates
      Object.defineProperty(channel, '_createdAt', {
        value: new Date(c.createdAt),
        writable: true,
      });
      Object.defineProperty(channel, '_updatedAt', {
        value: new Date(c.updatedAt),
        writable: true,
      });

      // Add messages
      c.messages.forEach((msg) => {
        const message = TeamChannelMessage.create(
          msg.id,
          msg.content,
          msg.senderId,
          msg.metadata
        );
        Object.defineProperty(message, '_createdAt', {
          value: new Date(msg.createdAt),
          writable: true,
        });
        channel.addMessage(message);
      });

      return channel;
    });

    const team = Team.create(
      item.id,
      item.name,
      item.description,
      members,
      channels
    );

    // Reconstruct dates
    Object.defineProperty(team, '_createdAt', {
      value: new Date(item.createdAt),
      writable: true,
    });
    Object.defineProperty(team, '_updatedAt', {
      value: new Date(item.updatedAt),
      writable: true,
    });

    return team;
  }

  private toDynamoDB(team: Team): DynamoDBTeam {
    return {
      id: team.id,
      name: team.name,
      description: team.description,
      members: team.members.map((m) => ({
        agentId: m.agentId,
        role: m.role,
        joinedAt: m.joinedAt.toISOString(),
      })),
      channels: team.channels.map((c) => ({
        id: c.id,
        name: c.name,
        description: c.description,
        createdBy: c.createdBy,
        createdAt: c.createdAt.toISOString(),
        updatedAt: c.updatedAt.toISOString(),
        members: c.members.map((m) => ({
          agentId: m.agentId,
          role: m.role,
          joinedAt: m.joinedAt.toISOString(),
        })),
        messages: c.messages.map((msg) => ({
          id: msg.id,
          content: msg.content,
          senderId: msg.senderId,
          createdAt: msg.createdAt.toISOString(),
          metadata: msg.metadata,
        })),
      })),
      createdAt: team.createdAt.toISOString(),
      updatedAt: team.updatedAt.toISOString(),
    };
  }

  async findById(id: string): Promise<Team | null> {
    const command = new GetCommand({
      TableName: this.tableName,
      Key: { id },
    });

    const response = await this.docClient.send(command);
    return response.Item ? this.toEntity(response.Item as DynamoDBTeam) : null;
  }

  async findAll(): Promise<Team[]> {
    const command = new ScanCommand({
      TableName: this.tableName,
    });

    const response = await this.docClient.send(command);
    return (response.Items || []).map((item) =>
      this.toEntity(item as DynamoDBTeam)
    );
  }

  async findByMemberId(agentId: string): Promise<Team[]> {
    const command = new ScanCommand({
      TableName: this.tableName,
      FilterExpression: 'contains(members, :agentId)',
      ExpressionAttributeValues: {
        ':agentId': agentId,
      },
    });

    const response = await this.docClient.send(command);
    return (response.Items || []).map((item) =>
      this.toEntity(item as DynamoDBTeam)
    );
  }

  async save(team: Team): Promise<void> {
    const command = new PutCommand({
      TableName: this.tableName,
      Item: this.toDynamoDB(team),
    });

    await this.docClient.send(command);
  }

  async delete(id: string): Promise<void> {
    const command = new DeleteCommand({
      TableName: this.tableName,
      Key: { id },
    });

    await this.docClient.send(command);
  }

  async exists(id: string): Promise<boolean> {
    const command = new GetCommand({
      TableName: this.tableName,
      Key: { id },
      ProjectionExpression: 'id',
    });

    const response = await this.docClient.send(command);
    return !!response.Item;
  }

  async findByName(name: string): Promise<Team | null> {
    const command = new ScanCommand({
      TableName: this.tableName,
      FilterExpression: '#name = :name',
      ExpressionAttributeNames: {
        '#name': 'name',
      },
      ExpressionAttributeValues: {
        ':name': name,
      },
      Limit: 1,
    });

    const response = await this.docClient.send(command);
    return response.Items && response.Items.length > 0
      ? this.toEntity(response.Items[0] as DynamoDBTeam)
      : null;
  }
}
