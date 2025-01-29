export class TaskDto {
  id: string;
  title: string;
  description: string;
  agentId?: string;
  dependencies?: string[];
  context?: Record<string, any>;
  config?: Record<string, any>;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  result?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}
