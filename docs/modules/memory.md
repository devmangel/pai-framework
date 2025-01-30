# Memory Module

## Overview

The Memory module is responsible for managing memory entries within the system. It includes functionalities for creating, updating, deleting, and querying memory entries, as well as handling memory metadata and embeddings.

## Structure

The module is structured as follows:

- `memory.module.ts`: Defines the Memory module and its dependencies.
- `domain/`: Contains the domain layer, including entities and repository interfaces.
  - `entities/memory-entry.entity.ts`: Defines the `MemoryEntry` entity.
  - `ports/memory.repository.ts`: Defines the `MemoryRepository` interface and related exceptions.
- `infrastructure/`: Contains the infrastructure layer, including repository implementations.
  - `repositories/dynamodb/memory.repository.ts`: Implements the `MemoryRepository` interface using DynamoDB.

## Components

### Memory Module

The `MemoryModule` is defined in `memory.module.ts` and includes the following components:

- `MemoryRepository`: Interface for the memory repository.

### Entities

#### MemoryEntry

The `MemoryEntry` entity represents a memory entry in the system. It includes properties such as `id`, `content`, `metadata`, `agentId`, `embedding`, `createdAt`, and `updatedAt`.

### Repositories

#### MemoryRepository

The `MemoryRepository` interface defines the methods for interacting with the memory repository. These methods include:

- `save(entry: MemoryEntry): Promise<void>`
- `findById(id: string): Promise<MemoryEntry | null>`
- `update(id: string, entry: Partial<MemoryEntry>): Promise<void>`
- `delete(id: string): Promise<void>`
- `exists(id: string): Promise<boolean>`
- `findByType(type: MemoryType): Promise<MemoryEntry[]>`
- `findByFilter(filter: MemoryFilter): Promise<MemoryEntry[]>`
- `findByContent(content: string, similarity: number): Promise<MemoryEntry[]>`
- `findByMetadata(metadata: Partial<MemoryMetadata>): Promise<MemoryEntry[]>`
- `saveBatch(entries: MemoryEntry[]): Promise<void>`
- `findByIds(ids: string[]): Promise<(MemoryEntry | null)[]>`
- `deleteBatch(ids: string[]): Promise<void>`
- `updateBatch(updates: Array<{ id: string; entry: Partial<MemoryEntry> }>): Promise<void>`
- `findSimilar(embedding: number[], limit?: number): Promise<MemoryEntry[]>`
- `updateEmbedding(id: string, embedding: number[]): Promise<void>`
- `findByEmbeddingRange(embedding: number[], minSimilarity: number, maxSimilarity: number): Promise<MemoryEntry[]>`
- `findByAgent(agentId: string, type?: MemoryType): Promise<MemoryEntry[]>`
- `deleteByAgent(agentId: string, type?: MemoryType): Promise<void>`
- `clear(type?: MemoryType): Promise<void>`
- `count(filter?: MemoryFilter): Promise<number>`
- `getStorageStats(): Promise<{ totalSize: number; entriesCount: Record<MemoryType, number>; lastUpdate: Date }>`
- `vacuum(): Promise<void>`
- `optimize(): Promise<void>`
- `backup(): Promise<string>`
- `restore(backup: string): Promise<void>`
- `transaction<T>(operation: () => Promise<T>): Promise<T>`

### Implementations

#### DynamoDBMemoryRepository

The `DynamoDBMemoryRepository` class implements the `MemoryRepository` interface using DynamoDB. It provides methods to interact with DynamoDB for storing, retrieving, updating, and deleting memory entries.
