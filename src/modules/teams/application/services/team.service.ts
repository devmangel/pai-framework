import { Injectable, Inject } from '@nestjs/common';
import { TeamRepository, TEAM_REPOSITORY } from '../../domain/ports/team.repository';
import { CreateTeamDto } from '../../interface/http/dtos/create-team.dto';
import { TeamMapper } from '../mappers/team.mapper';
import { Team } from '../../domain/entities/team.entity';
import { TeamRole } from '../../domain/enums/team-role.enum';
import { TeamMember } from '../../domain/value-objects/team-member.vo';
import { TeamChannel, TeamChannelMessage } from '../../domain/value-objects/team-channel.vo';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class TeamService {
  constructor(
    @Inject(TEAM_REPOSITORY)
    private readonly teamRepository: TeamRepository,
  ) {}

  async createTeam(dto: CreateTeamDto): Promise<Team> {
    const team = TeamMapper.toEntity(dto);
    await this.teamRepository.save(team);
    return team;
  }

  async getTeamById(id: string): Promise<Team> {
    const team = await this.teamRepository.findById(id);
    if (!team) {
      throw new Error('Team not found');
    }
    return team;
  }

  async getAllTeams(): Promise<Team[]> {
    return this.teamRepository.findAll();
  }

  async updateTeam(id: string, dto: Partial<CreateTeamDto>): Promise<Team> {
    const team = await this.getTeamById(id);

    if (dto.name) {
      team.updateName(dto.name);
    }

    if (dto.description) {
      team.updateDescription(dto.description);
    }

    if (dto.members) {
      // Remove existing members not in the update
      const newAgentIds = dto.members.map(m => m.agentId);
      team.members
        .filter(m => !newAgentIds.includes(m.agentId))
        .forEach(m => team.removeMember(m.agentId));

      // Update or add new members
      dto.members.forEach(memberDto => {
        const member = TeamMember.create(memberDto.agentId, memberDto.role);
        if (team.hasMember(memberDto.agentId)) {
          team.updateMemberRole(memberDto.agentId, memberDto.role);
        } else {
          team.addMember(member);
        }
      });
    }

    await this.teamRepository.save(team);
    return team;
  }

  async deleteTeam(id: string): Promise<void> {
    const exists = await this.teamRepository.exists(id);
    if (!exists) {
      throw new Error('Team not found');
    }
    await this.teamRepository.delete(id);
  }

  async addMemberToTeam(
    teamId: string,
    agentId: string,
    role: TeamRole = TeamRole.MEMBER,
  ): Promise<Team> {
    const team = await this.getTeamById(teamId);
    const member = TeamMember.create(agentId, role);
    team.addMember(member);
    await this.teamRepository.save(team);
    return team;
  }

  async removeMemberFromTeam(teamId: string, agentId: string): Promise<Team> {
    const team = await this.getTeamById(teamId);
    team.removeMember(agentId);
    await this.teamRepository.save(team);
    return team;
  }

  async updateMemberRole(
    teamId: string,
    agentId: string,
    role: TeamRole,
  ): Promise<Team> {
    const team = await this.getTeamById(teamId);
    team.updateMemberRole(agentId, role);
    await this.teamRepository.save(team);
    return team;
  }

  async getTeamsByMemberId(agentId: string): Promise<Team[]> {
    return this.teamRepository.findByMemberId(agentId);
  }

  // Channel management methods
  async createChannel(
    teamId: string,
    name: string,
    description: string,
    createdBy: string,
    initialMembers: string[] = [],
  ): Promise<Team> {
    const team = await this.getTeamById(teamId);
    
    // Validate creator is a team member
    if (!team.hasMember(createdBy)) {
      throw new Error('Channel creator must be a team member');
    }

    // Create channel members from team members
    const channelMembers = initialMembers
      .filter(memberId => team.hasMember(memberId))
      .map(memberId => {
        const teamMember = team.members.find(m => m.agentId === memberId);
        return TeamMember.create(memberId, teamMember!.role);
      });

    // Add creator if not in initial members
    if (!channelMembers.some(m => m.agentId === createdBy)) {
      const creatorTeamMember = team.members.find(m => m.agentId === createdBy);
      channelMembers.push(TeamMember.create(createdBy, creatorTeamMember!.role));
    }

    team.createChannel(
      uuidv4(),
      name,
      description,
      createdBy,
      channelMembers,
    );

    await this.teamRepository.save(team);
    return team;
  }

  async updateChannelDescription(
    teamId: string,
    channelId: string,
    description: string,
    updatedBy: string,
  ): Promise<Team> {
    const team = await this.getTeamById(teamId);
    const channel = team.getChannel(channelId);

    if (!channel) {
      throw new Error('Channel not found');
    }

    if (!channel.hasMember(updatedBy)) {
      throw new Error('Only channel members can update channel description');
    }

    team.updateChannelDescription(channelId, description);
    await this.teamRepository.save(team);
    return team;
  }

  async addMemberToChannel(
    teamId: string,
    channelId: string,
    memberId: string,
    addedBy: string,
  ): Promise<Team> {
    const team = await this.getTeamById(teamId);
    const channel = team.getChannel(channelId);

    if (!channel) {
      throw new Error('Channel not found');
    }

    if (!channel.hasMember(addedBy)) {
      throw new Error('Only channel members can add new members');
    }

    if (!team.hasMember(memberId)) {
      throw new Error('Can only add existing team members to channel');
    }

    const member = team.members.find(m => m.agentId === memberId);
    team.addMemberToChannel(channelId, member!);
    await this.teamRepository.save(team);
    return team;
  }

  async removeMemberFromChannel(
    teamId: string,
    channelId: string,
    memberId: string,
    removedBy: string,
  ): Promise<Team> {
    const team = await this.getTeamById(teamId);
    const channel = team.getChannel(channelId);

    if (!channel) {
      throw new Error('Channel not found');
    }

    const remover = channel.members.find(m => m.agentId === removedBy);
    if (!remover || !remover.canRemoveMembers()) {
      throw new Error('Only admins and owners can remove channel members');
    }

    team.removeMemberFromChannel(channelId, memberId);
    await this.teamRepository.save(team);
    return team;
  }

  async addMessageToChannel(
    teamId: string,
    channelId: string,
    content: string,
    senderId: string,
    metadata: Record<string, any> = {},
  ): Promise<Team> {
    const team = await this.getTeamById(teamId);
    const channel = team.getChannel(channelId);

    if (!channel) {
      throw new Error('Channel not found');
    }

    if (!channel.hasMember(senderId)) {
      throw new Error('Only channel members can send messages');
    }

    const message = TeamChannelMessage.create(
      uuidv4(),
      content,
      senderId,
      metadata,
    );

    channel.addMessage(message);
    await this.teamRepository.save(team);
    return team;
  }
}
