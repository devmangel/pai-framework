import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpException,
  HttpStatus,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { TeamService } from '../../application/services/team.service';
import { CreateTeamDto } from '../../interface/http/dtos/create-team.dto';
import { TeamMapper } from '../../application/mappers/team.mapper';
import { TeamRole } from '../../domain/enums/team-role.enum';
import {
  CreateChannelDto,
  UpdateChannelDescriptionDto,
  AddChannelMemberDto,
  RemoveChannelMemberDto,
  AddChannelMessageDto,
} from '../../interface/http/dtos/channel.dto';

@Controller('teams')
@UsePipes(new ValidationPipe({ transform: true }))
export class TeamsController {
  constructor(private readonly teamService: TeamService) {}

  @Post()
  async createTeam(@Body() createTeamDto: CreateTeamDto) {
    try {
      const team = await this.teamService.createTeam(createTeamDto);
      return TeamMapper.toDto(team);
    } catch (error) {
      throw new HttpException(
        error.message || 'Error creating team',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get()
  async getAllTeams() {
    try {
      const teams = await this.teamService.getAllTeams();
      return teams.map(team => TeamMapper.toDto(team));
    } catch (error) {
      throw new HttpException(
        error.message || 'Error fetching teams',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  async getTeamById(@Param('id') id: string) {
    try {
      const team = await this.teamService.getTeamById(id);
      return TeamMapper.toDto(team);
    } catch (error) {
      throw new HttpException(
        error.message || 'Team not found',
        HttpStatus.NOT_FOUND,
      );
    }
  }

  @Put(':id')
  async updateTeam(
    @Param('id') id: string,
    @Body() updateTeamDto: Partial<CreateTeamDto>,
  ) {
    try {
      const team = await this.teamService.updateTeam(id, updateTeamDto);
      return TeamMapper.toDto(team);
    } catch (error) {
      throw new HttpException(
        error.message || 'Error updating team',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Delete(':id')
  async deleteTeam(@Param('id') id: string) {
    try {
      await this.teamService.deleteTeam(id);
      return { message: 'Team deleted successfully' };
    } catch (error) {
      throw new HttpException(
        error.message || 'Error deleting team',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post(':teamId/members/:agentId')
  async addMemberToTeam(
    @Param('teamId') teamId: string,
    @Param('agentId') agentId: string,
    @Body('role') role: TeamRole = TeamRole.MEMBER,
  ) {
    try {
      const team = await this.teamService.addMemberToTeam(teamId, agentId, role);
      return TeamMapper.toDto(team);
    } catch (error) {
      throw new HttpException(
        error.message || 'Error adding member to team',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Delete(':teamId/members/:agentId')
  async removeMemberFromTeam(
    @Param('teamId') teamId: string,
    @Param('agentId') agentId: string,
  ) {
    try {
      const team = await this.teamService.removeMemberFromTeam(teamId, agentId);
      return TeamMapper.toDto(team);
    } catch (error) {
      throw new HttpException(
        error.message || 'Error removing member from team',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Put(':teamId/members/:agentId/role')
  async updateMemberRole(
    @Param('teamId') teamId: string,
    @Param('agentId') agentId: string,
    @Body('role') role: TeamRole,
  ) {
    try {
      const team = await this.teamService.updateMemberRole(teamId, agentId, role);
      return TeamMapper.toDto(team);
    } catch (error) {
      throw new HttpException(
        error.message || 'Error updating member role',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('members/:agentId')
  async getTeamsByMemberId(@Param('agentId') agentId: string) {
    try {
      const teams = await this.teamService.getTeamsByMemberId(agentId);
      return teams.map(team => TeamMapper.toDto(team));
    } catch (error) {
      throw new HttpException(
        error.message || 'Error fetching teams for member',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Channel endpoints
  @Post(':teamId/channels')
  async createChannel(
    @Param('teamId') teamId: string,
    @Body() createChannelDto: CreateChannelDto,
  ) {
    try {
      const team = await this.teamService.createChannel(
        teamId,
        createChannelDto.name,
        createChannelDto.description,
        createChannelDto.createdBy,
        createChannelDto.initialMembers,
      );
      return TeamMapper.toDto(team);
    } catch (error) {
      throw new HttpException(
        error.message || 'Error creating channel',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Put(':teamId/channels/:channelId/description')
  async updateChannelDescription(
    @Param('teamId') teamId: string,
    @Body() updateDto: UpdateChannelDescriptionDto,
  ) {
    try {
      const team = await this.teamService.updateChannelDescription(
        teamId,
        updateDto.channelId,
        updateDto.description,
        updateDto.updatedBy,
      );
      return TeamMapper.toDto(team);
    } catch (error) {
      throw new HttpException(
        error.message || 'Error updating channel description',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post(':teamId/channels/:channelId/members')
  async addMemberToChannel(
    @Param('teamId') teamId: string,
    @Body() addMemberDto: AddChannelMemberDto,
  ) {
    try {
      const team = await this.teamService.addMemberToChannel(
        teamId,
        addMemberDto.channelId,
        addMemberDto.memberId,
        addMemberDto.addedBy,
      );
      return TeamMapper.toDto(team);
    } catch (error) {
      throw new HttpException(
        error.message || 'Error adding member to channel',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Delete(':teamId/channels/:channelId/members')
  async removeMemberFromChannel(
    @Param('teamId') teamId: string,
    @Body() removeMemberDto: RemoveChannelMemberDto,
  ) {
    try {
      const team = await this.teamService.removeMemberFromChannel(
        teamId,
        removeMemberDto.channelId,
        removeMemberDto.memberId,
        removeMemberDto.removedBy,
      );
      return TeamMapper.toDto(team);
    } catch (error) {
      throw new HttpException(
        error.message || 'Error removing member from channel',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post(':teamId/channels/:channelId/messages')
  async addMessageToChannel(
    @Param('teamId') teamId: string,
    @Body() messageDto: AddChannelMessageDto,
  ) {
    try {
      const team = await this.teamService.addMessageToChannel(
        teamId,
        messageDto.channelId,
        messageDto.content,
        messageDto.senderId,
        messageDto.metadata,
      );
      return TeamMapper.toDto(team);
    } catch (error) {
      throw new HttpException(
        error.message || 'Error adding message to channel',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
