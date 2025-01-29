export enum MemoryType {
  SHORT_TERM = 'SHORT_TERM',   // RAG-based recent memory
  LONG_TERM = 'LONG_TERM',     // Persistent storage
  ENTITY = 'ENTITY',           // Entity-specific information
  CONTEXTUAL = 'CONTEXTUAL'    // Combined context memory
}

export enum MemoryStorageType {
  CHROMA = 'CHROMA',          // Vector storage for RAG
  SQLITE = 'SQLITE',          // Relational storage
  REDIS = 'REDIS',            // Cache storage
  CUSTOM = 'CUSTOM'           // Custom implementation
}

export enum EmbeddingProvider {
  OPENAI = 'OPENAI',
  HUGGINGFACE = 'HUGGINGFACE',
  COHERE = 'COHERE',
  CUSTOM = 'CUSTOM'
}

export enum MemoryOperation {
  READ = 'READ',
  WRITE = 'WRITE',
  DELETE = 'DELETE',
  SEARCH = 'SEARCH',
  UPDATE = 'UPDATE'
}
