import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  Query, 
  HttpException, 
  HttpStatus,
  Inject,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { CreateAgentUseCase } from '../../application/use-cases/create-agent.use-case';
import { AgentRepository, DuplicateAgentError, AgentNotFoundError } from '../../domain/ports/agent.repository';
import { AgentId } from '../../domain/value-objects/agent-id.vo';
import { CreateAgentDto } from './dtos/create-agent.dto';
import { AgentResponseDto, AgentListResponseDto, DeleteAgentResponseDto } from './dtos/agent-response.dto';

@Controller('agents')
@UseInterceptors(ClassSerializerInterceptor)
export class AgentsController {
  constructor(
    @Inject('AgentRepository')
    private readonly agentRepository: AgentRepository,
    private readonly createAgentUseCase: CreateAgentUseCase,
  ) {}

  @Post()
  async createAgent(@Body() createAgentDto: CreateAgentDto): Promise<AgentResponseDto> {
    try {
      const agent = await this.createAgentUseCase.execute(createAgentDto);
      return new AgentResponseDto(agent.toJSON());
    } catch (error) {
      if (error instanceof DuplicateAgentError) {
        throw new HttpException(error.message, HttpStatus.CONFLICT);
      }
      throw new HttpException('Error creating agent', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get()
  async findAll(@Query() query: any): Promise<AgentListResponseDto> {
    try {
      const agents = await this.agentRepository.findAll();
      return new AgentListResponseDto(
        agents.map(agent => new AgentResponseDto(agent.toJSON())),
        agents.length
      );
    } catch (error) {
      throw new HttpException('Error fetching agents', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<AgentResponseDto> {
    try {
      const agent = await this.agentRepository.findById(new AgentId(id));
      if (!agent) {
        throw new AgentNotFoundError(id);
      }
      return new AgentResponseDto(agent.toJSON());
    } catch (error) {
      if (error instanceof AgentNotFoundError) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      }
      throw new HttpException('Error fetching agent', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateAgentDto: any): Promise<AgentResponseDto> {
    try {
      const existingAgent = await this.agentRepository.findById(new AgentId(id));
      if (!existingAgent) {
        throw new AgentNotFoundError(id);
      }

      // TODO: Implement update logic using a dedicated use case
      throw new HttpException('Not implemented', HttpStatus.NOT_IMPLEMENTED);
    } catch (error) {
      if (error instanceof AgentNotFoundError) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      }
      throw new HttpException('Error updating agent', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<DeleteAgentResponseDto> {
    try {
      await this.agentRepository.delete(new AgentId(id));
      return new DeleteAgentResponseDto('Agent deleted successfully');
    } catch (error) {
      if (error instanceof AgentNotFoundError) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      }
      throw new HttpException('Error deleting agent', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('team/:teamId')
  async findByTeam(@Param('teamId') teamId: string): Promise<AgentListResponseDto> {
    try {
      const agents = await this.agentRepository.findByTeamId(teamId);
      return new AgentListResponseDto(
        agents.map(agent => new AgentResponseDto(agent.toJSON())),
        agents.length
      );
    } catch (error) {
      throw new HttpException('Error fetching team agents', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('capability/:capability')
  async findByCapability(@Param('capability') capability: string): Promise<AgentListResponseDto> {
    try {
      const agents = await this.agentRepository.findByCapability(capability);
      return new AgentListResponseDto(
        agents.map(agent => new AgentResponseDto(agent.toJSON())),
        agents.length
      );
    } catch (error) {
      throw new HttpException('Error fetching agents by capability', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('role/:role')
  async findByRole(@Param('role') role: string): Promise<AgentListResponseDto> {
    try {
      const agents = await this.agentRepository.findByRole(role);
      return new AgentListResponseDto(
        agents.map(agent => new AgentResponseDto(agent.toJSON())),
        agents.length
      );
    } catch (error) {
      throw new HttpException('Error fetching agents by role', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('status/available')
  async findAvailable(): Promise<AgentListResponseDto> {
    try {
      const agents = await this.agentRepository.findAvailableAgents();
      return new AgentListResponseDto(
        agents.map(agent => new AgentResponseDto(agent.toJSON())),
        agents.length
      );
    } catch (error) {
      throw new HttpException('Error fetching available agents', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('status/busy')
  async findBusy(): Promise<AgentListResponseDto> {
    try {
      const agents = await this.agentRepository.findBusyAgents();
      return new AgentListResponseDto(
        agents.map(agent => new AgentResponseDto(agent.toJSON())),
        agents.length
      );
    } catch (error) {
      throw new HttpException('Error fetching busy agents', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
