export class TeamDto {
  id: string;
  name: string;
  description: string;
  agentIds: string[];
  config?: Record<string, any>;
  leadAgentId?: string;
  createdAt: Date;
  updatedAt: Date;
}
