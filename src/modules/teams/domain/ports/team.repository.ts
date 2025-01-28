import { Team } from '../entities/team.entity';

export interface TeamRepository {
  findById(id: string): Promise<Team | null>;
  findAll(): Promise<Team[]>;
  findByMemberId(agentId: string): Promise<Team[]>;
  save(team: Team): Promise<void>;
  delete(id: string): Promise<void>;
  exists(id: string): Promise<boolean>;
  findByName(name: string): Promise<Team | null>;
}

export const TEAM_REPOSITORY = Symbol('TeamRepository');
