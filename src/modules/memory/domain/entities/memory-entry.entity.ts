import { Agent } from '../../../agents/domain/entities/agent.entity';

export interface MemoryMetadata {
  source?: string;
  timestamp: Date;
  context?: Record<string, any>;
  tags?: string[];
}

export class MemoryEntry {
  constructor(
    private readonly id: string,
    private readonly content: string,
    private readonly metadata: MemoryMetadata,
    private readonly agentId?: string,
    private readonly embedding?: number[],
    private readonly createdAt: Date = new Date(),
    private readonly updatedAt: Date = new Date(),
  ) {
    this.validate();
  }

  private validate(): void {
    if (!this.id || typeof this.id !== 'string') {
      throw new Error('Memory entry ID must be a non-empty string');
    }
    if (!this.content || typeof this.content !== 'string') {
      throw new Error('Memory entry content must be a non-empty string');
    }
    if (!this.metadata || typeof this.metadata !== 'object') {
      throw new Error('Memory entry metadata must be an object');
    }
    if (!this.metadata.timestamp) {
      throw new Error('Memory entry metadata must include a timestamp');
    }
  }

  // Getters
  public getId(): string {
    return this.id;
  }

  public getContent(): string {
    return this.content;
  }

  public getMetadata(): MemoryMetadata {
    return { ...this.metadata };
  }

  public getAgentId(): string | undefined {
    return this.agentId;
  }

  public getEmbedding(): number[] | undefined {
    return this.embedding ? [...this.embedding] : undefined;
  }

  public getCreatedAt(): Date {
    return this.createdAt;
  }

  public getUpdatedAt(): Date {
    return this.updatedAt;
  }

  // Factory methods
  public static create(
    id: string,
    content: string,
    metadata: MemoryMetadata,
    agentId?: string,
    embedding?: number[],
  ): MemoryEntry {
    return new MemoryEntry(id, content, metadata, agentId, embedding);
  }

  public toJSON() {
    return {
      id: this.id,
      content: this.content,
      metadata: this.metadata,
      agentId: this.agentId,
      embedding: this.embedding,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }
}
