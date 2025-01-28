import { Team } from '../../domain/entities/team.entity';
import { TeamMember } from '../../domain/value-objects/team-member.vo';
import { CreateTeamDto, CreateTeamMemberDto } from '../dtos/create-team.dto';
import { TeamResponseDto, TeamMemberResponseDto } from '../dtos/team-response.dto';
import { TeamChannelResponseDto, TeamChannelMessageResponseDto, TeamChannelMemberResponseDto } from '../dtos/channel-response.dto';
import { v4 as uuidv4 } from 'uuid';

export class TeamMapper {
  static toEntity(dto: CreateTeamDto): Team {
    const members = dto.members.map(memberDto => 
      TeamMapper.toTeamMember(memberDto)
    );

    return Team.create(
      uuidv4(),
      dto.name,
      dto.description,
      members
    );
  }

  static toTeamMember(dto: CreateTeamMemberDto): TeamMember {
    return TeamMember.create(
      dto.agentId,
      dto.role
    );
  }

  static toDto(entity: Team): TeamResponseDto {
    return {
      id: entity.id,
      name: entity.name,
      description: entity.description,
      members: entity.members.map(member => TeamMapper.toMemberDto(member)),
      channels: entity.channels.map(channel => TeamMapper.toChannelDto(channel)),
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt
    };
  }

  private static toMemberDto(member: TeamMember): TeamMemberResponseDto {
    return {
      agentId: member.agentId,
      role: member.role,
      joinedAt: member.joinedAt
    };
  }

  private static toChannelDto(channel: any): TeamChannelResponseDto {
    return {
      id: channel.id,
      name: channel.name,
      description: channel.description,
      createdBy: channel.createdBy,
      createdAt: channel.createdAt.toISOString(),
      updatedAt: channel.updatedAt.toISOString(),
      members: channel.members.map((member: TeamMember) => ({
        agentId: member.agentId,
        role: member.role,
        joinedAt: member.joinedAt.toISOString()
      })),
      messages: channel.messages.map((message: any) => ({
        id: message.id,
        content: message.content,
        senderId: message.senderId,
        createdAt: message.createdAt.toISOString(),
        metadata: message.metadata
      }))
    };
  }
}
