import { MemoryEntry, MemoryMetadata } from '../entities/memory-entry.entity';
import { MemoryType, MemoryOperation } from '../enums/memory-type.enum';

export interface MemorySearchOptions {
  content?: string;
  metadata?: Partial<MemoryMetadata>;
  similarity?: number;
  limit?: number;
  offset?: number;
}

export interface MemoryStats {
  totalEntries: number;
  byType: Record<MemoryType, number>;
  usage: {
    storage: number;  // in bytes
    embeddings: number;  // count of embedded entries
  };
  operations: Record<MemoryOperation, number>;
  lastAccess: Date;
}

export interface MemoryService {
  // Core operations
  store(
    content: string,
    metadata: MemoryMetadata,
    type: MemoryType,
    agentId?: string
  ): Promise<MemoryEntry>;

  retrieve(id: string, type: MemoryType): Promise<MemoryEntry | null>;

  search(
    options: MemorySearchOptions,
    type: MemoryType
  ): Promise<MemoryEntry[]>;

  update(
    id: string,
    content: string,
    metadata: Partial<MemoryMetadata>,
    type: MemoryType
  ): Promise<MemoryEntry>;

  delete(id: string, type: MemoryType): Promise<void>;

  // Batch operations
  storeBatch(
    entries: Array<{
      content: string;
      metadata: MemoryMetadata;
      type: MemoryType;
      agentId?: string;
    }>
  ): Promise<MemoryEntry[]>;

  retrieveBatch(
    ids: string[],
    type: MemoryType
  ): Promise<(MemoryEntry | null)[]>;

  // Semantic operations
  findSimilar(
    content: string,
    type: MemoryType,
    limit?: number
  ): Promise<MemoryEntry[]>;

  summarize(
    entries: MemoryEntry[],
    maxLength?: number
  ): Promise<string>;

  // Management operations
  getStats(type?: MemoryType): Promise<MemoryStats>;

  clear(type?: MemoryType): Promise<void>;

  backup(type?: MemoryType): Promise<string>;

  restore(backup: string, type?: MemoryType): Promise<void>;

  // Agent-specific operations
  getAgentMemory(
    agentId: string,
    type: MemoryType,
    options?: MemorySearchOptions
  ): Promise<MemoryEntry[]>;

  clearAgentMemory(
    agentId: string,
    type?: MemoryType
  ): Promise<void>;

  // Utility operations
  validateEntry(entry: MemoryEntry): Promise<boolean>;

  generateEmbedding(content: string): Promise<number[]>;

  compressMemory(
    entries: MemoryEntry[],
    targetSize: number
  ): Promise<MemoryEntry[]>;
}
