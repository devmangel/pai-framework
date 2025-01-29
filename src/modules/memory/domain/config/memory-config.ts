import { EmbeddingProvider, MemoryStorageType, MemoryType } from '../enums/memory-type.enum';

export interface MemoryStorageConfig {
  type: MemoryStorageType;
  connection: {
    host?: string;
    port?: number;
    path?: string;
    url?: string;
    credentials?: Record<string, string>;
  };
  options?: {
    maxSize?: number;
    ttl?: number;
    compression?: boolean;
    encryption?: boolean;
  };
}

export interface EmbeddingConfig {
  provider: EmbeddingProvider;
  model?: string;
  apiKey?: string;
  dimensions?: number;
  batchSize?: number;
  cache?: {
    enabled: boolean;
    ttl: number;
  };
}

export interface MemoryTypeConfig {
  enabled: boolean;
  storage: MemoryStorageConfig;
  ttl?: number;
  maxEntries?: number;
  compressionThreshold?: number;
}

export interface MemoryConfig {
  // Storage configuration for each memory type
  shortTerm: MemoryTypeConfig & {
    ragConfig?: {
      chunkSize?: number;
      overlapSize?: number;
      similarityThreshold?: number;
    };
  };
  longTerm: MemoryTypeConfig & {
    backupInterval?: number;
    pruningStrategy?: 'age' | 'relevance' | 'hybrid';
  };
  entity: MemoryTypeConfig & {
    updateFrequency?: number;
    mergeStrategy?: 'replace' | 'append' | 'smart';
  };
  contextual: MemoryTypeConfig & {
    maxContextSize?: number;
    contextWindowSize?: number;
  };

  // Embedding configuration
  embedding: EmbeddingConfig;

  // Global settings
  global: {
    enabled: boolean;
    debug?: boolean;
    maxTotalSize?: number;
    backupEnabled?: boolean;
    backupPath?: string;
    metrics?: {
      enabled: boolean;
      interval: number;
    };
    encryption?: {
      enabled: boolean;
      algorithm: string;
      keyPath: string;
    };
  };

  // Performance tuning
  performance: {
    maxConcurrentOperations?: number;
    batchSize?: number;
    cacheSize?: number;
    optimizationInterval?: number;
    compressionLevel?: number;
  };

  // Integration settings
  integration: {
    llm?: {
      enabled: boolean;
      model?: string;
      maxTokens?: number;
    };
    agents?: {
      enabled: boolean;
      maxMemoryPerAgent?: number;
    };
    tools?: {
      enabled: boolean;
      allowedTools?: string[];
    };
  };
}
