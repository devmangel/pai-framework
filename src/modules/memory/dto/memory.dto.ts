export class MemoryDto {
  id: string;
  content: string;
  agentId?: string;
  taskId?: string;
  tags?: string[];
  metadata?: Record<string, any>;
  type: 'conversation' | 'task_result' | 'observation' | 'knowledge';
  createdAt: Date;
  embedding?: number[];
}
