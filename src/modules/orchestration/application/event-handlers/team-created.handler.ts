import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { TeamCreatedEvent } from '../../domain/events/team-created.event';
import { OrchestratorTeamsService } from '../services/orchestrator-teams.service';

@EventsHandler(TeamCreatedEvent)
export class TeamCreatedHandler implements IEventHandler<TeamCreatedEvent> {
  private readonly logger = new Logger(TeamCreatedHandler.name);

  constructor(
    private readonly orchestratorTeamsService: OrchestratorTeamsService,
  ) {}

  async handle(event: TeamCreatedEvent) {
    this.logger.log(`Handling TeamCreatedEvent -> Team: ${event.teamId}`);
    // Llama al servicio de orquestación de Teams
    await this.orchestratorTeamsService.handleTeamCreated(event.teamId, event.creatorAgentId);
  }
}
