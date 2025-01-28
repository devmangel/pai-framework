import { Agent } from '../entities/agent.entity';
import { AgentId } from '../value-objects/agent-id.vo';

export interface AgentRepository {
  save(agent: Agent): Promise<void>;
  findById(id: AgentId): Promise<Agent | null>;
  findAll(): Promise<Agent[]>;
  findByName(name: string): Promise<Agent[]>;
  update(agent: Agent): Promise<void>;
  delete(id: AgentId): Promise<void>;
  
  // Team-related queries
  findByTeamId(teamId: string): Promise<Agent[]>;
  
  // Capability-related queries
  findByCapability(capabilityName: string): Promise<Agent[]>;
  
  // Role-related queries
  findByRole(roleName: string): Promise<Agent[]>;
  
  // Status-related queries
  findAvailableAgents(): Promise<Agent[]>;
  findBusyAgents(): Promise<Agent[]>;
  
  // Specialized queries
  findByExpertise(expertise: string[]): Promise<Agent[]>;
  findByGoals(goals: string[]): Promise<Agent[]>;
  
  // Batch operations
  saveMany(agents: Agent[]): Promise<void>;
  deleteMany(ids: AgentId[]): Promise<void>;
}

export interface AgentQueryOptions {
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: {
    field: string;
    operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'in';
    value: any;
  }[];
}

export class AgentNotFoundError extends Error {
  constructor(id: string) {
    super(`Agent with ID ${id} not found`);
    this.name = 'AgentNotFoundError';
  }
}

export class DuplicateAgentError extends Error {
  constructor(name: string) {
    super(`Agent with name ${name} already exists`);
    this.name = 'DuplicateAgentError';
  }
}

export class InvalidAgentDataError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidAgentDataError';
  }
}
