export class AgentDto {
  id: string;
  name: string;
  description: string;
  role: string;
  config?: Record<string, any>;
  llmProvider?: string;
  createdAt: Date;
  updatedAt: Date;
}
