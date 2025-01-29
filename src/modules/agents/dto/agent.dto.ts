export class AgentDto {
  id: string;
  name: string;
  description: string;
  role: string;
  config?: Record<string, any>;
  llmProvider?: string;
  createdAt: string;
  updatedAt: string;
}
