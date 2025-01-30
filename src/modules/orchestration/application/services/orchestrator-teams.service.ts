// src/modules/orchestration/application/services/orchestrator-teams.service.ts

import { Injectable, Logger } from '@nestjs/common';
// Ejemplo de import de TeamService
import { TeamService } from '../../../teams/application/services/team.service';

@Injectable()
export class OrchestratorTeamsService {
  private readonly logger = new Logger(OrchestratorTeamsService.name);

  constructor(
    private readonly teamsService: TeamService,
  ) {}

  /**
   * Orquesta acciones cuando se crea un nuevo equipo
   */
  async handleTeamCreated(teamId: string, creatorAgentId?: string) {
    this.logger.log(`Orchestrating new Team with ID: ${teamId}`);

    // 1. Buscar el team
    const team = await this.teamsService.getTeamById(teamId);
    if (!team) {
      this.logger.warn(`Team ${teamId} not found`);
      return;
    }

    // 2. Crear canales por defecto o asignar roles
    await this.teamsService.createChannel(teamId, team.name, 'general', creatorAgentId);

    // 3. Notificar a su creador si procede
    if (creatorAgentId) {
      // Podrías llamar a un notificador, emitir otro evento, etc.
      this.logger.log(`Notified creator agent ${creatorAgentId} about new team creation`);
    }
  }
}
