import { MemoryEntry, MemoryMetadata } from '../entities/memory-entry.entity';
import { MemoryType } from '../enums/memory-type.enum';

export interface MemoryFilter {
  type?: MemoryType;
  agentId?: string;
  metadata?: Partial<MemoryMetadata>;
  fromDate?: Date;
  toDate?: Date;
}

export interface MemoryRepository {
  // Basic CRUD operations
  save(entry: MemoryEntry): Promise<void>;
  findById(id: string): Promise<MemoryEntry | null>;
  update(id: string, entry: Partial<MemoryEntry>): Promise<void>;
  delete(id: string): Promise<void>;
  exists(id: string): Promise<boolean>;

  // Query operations
  findByType(type: MemoryType): Promise<MemoryEntry[]>;
  findByFilter(filter: MemoryFilter): Promise<MemoryEntry[]>;
  findByContent(content: string, similarity: number): Promise<MemoryEntry[]>;
  findByMetadata(metadata: Partial<MemoryMetadata>): Promise<MemoryEntry[]>;

  // Batch operations
  saveBatch(entries: MemoryEntry[]): Promise<void>;
  findByIds(ids: string[]): Promise<(MemoryEntry | null)[]>;
  deleteBatch(ids: string[]): Promise<void>;
  updateBatch(updates: Array<{ id: string; entry: Partial<MemoryEntry> }>): Promise<void>;

  // Vector operations
  findSimilar(embedding: number[], limit?: number): Promise<MemoryEntry[]>;
  updateEmbedding(id: string, embedding: number[]): Promise<void>;
  findByEmbeddingRange(
    embedding: number[],
    minSimilarity: number,
    maxSimilarity: number
  ): Promise<MemoryEntry[]>;

  // Agent-specific operations
  findByAgent(agentId: string, type?: MemoryType): Promise<MemoryEntry[]>;
  deleteByAgent(agentId: string, type?: MemoryType): Promise<void>;

  // Management operations
  clear(type?: MemoryType): Promise<void>;
  count(filter?: MemoryFilter): Promise<number>;
  getStorageStats(): Promise<{
    totalSize: number;
    entriesCount: Record<MemoryType, number>;
    lastUpdate: Date;
  }>;

  // Maintenance operations
  vacuum(): Promise<void>;
  optimize(): Promise<void>;
  backup(): Promise<string>;
  restore(backup: string): Promise<void>;

  // Transaction support
  transaction<T>(operation: () => Promise<T>): Promise<T>;
}
