# Memory Module

The Memory Module provides a robust and flexible memory system for agents, allowing them to store, retrieve, and search through their experiences and knowledge using vector embeddings and metadata.

## Features

- Vector similarity search for semantic memory retrieval
- Metadata-based filtering and querying
- Batch operations for efficient memory management
- DynamoDB-based persistence with automatic scaling
- Support for memory context and tagging

## Architecture

The module follows a hexagonal architecture pattern:

```
memory/
├── domain/              # Core domain logic
│   ├── entities/        # Domain entities
│   ├── ports/          # Interface definitions
│   ├── enums/          # Type definitions
│   └── exceptions/     # Domain-specific exceptions
├── infrastructure/     # Implementation details
│   └── repositories/   # Data persistence
├── __tests__/         # Test files
└── examples/          # Usage examples
```

## Setup

1. Configure AWS credentials in your `.env` file:

```env
AWS_REGION=us-west-2
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
```

2. Create the DynamoDB table:

```typescript
import { memoryTableSchema } from './infrastructure/repositories/dynamodb/table-schema';
import { DynamoDBClient, CreateTableCommand } from '@aws-sdk/client-dynamodb';

const dynamoDB = new DynamoDBClient({});
await dynamoDB.send(new CreateTableCommand(memoryTableSchema));
```

## Usage

### Basic Memory Operations

```typescript
import { MemoryEntry } from './domain/entities/memory-entry.entity';
import { DynamoDBMemoryRepository } from './infrastructure/repositories/dynamodb/memory.repository';

// Create a memory entry
const memory = MemoryEntry.create(
  uuidv4(),
  'Memory content',
  {
    source: 'conversation',
    timestamp: new Date(),
    context: { topic: 'weather' },
    tags: ['weather', 'query'],
  },
  agentId,
  embedding // vector embedding
);

// Save the memory
await memoryRepository.save(memory);

// Retrieve similar memories
const similarMemories = await memoryRepository.findSimilar(embedding, 5);

// Search by metadata
const weatherMemories = await memoryRepository.findByMetadata({
  tags: ['weather'],
});
```

### Batch Operations

```typescript
// Save multiple memories
await memoryRepository.saveBatch(memories);

// Update multiple memories
await memoryRepository.updateBatch(updates);

// Delete multiple memories
await memoryRepository.deleteBatch(ids);
```

### Memory Search

The module supports two main types of memory search:

1. **Vector Similarity Search**: Find memories with similar semantic meaning using vector embeddings
```typescript
const similarMemories = await memoryRepository.findSimilar(embedding, limit);
```

2. **Metadata Search**: Find memories based on metadata attributes
```typescript
const memories = await memoryRepository.findByMetadata({
  source: 'conversation',
  tags: ['important'],
});
```

## Testing

The module includes both unit tests and integration tests:

```bash
# Run unit tests
npm run test src/modules/memory

# Run integration tests
npm run test:e2e src/modules/memory
```

## Demo

Check out the `examples/memory-demo.ts` file for a complete working example of the memory system in action. To run the demo:

```bash
# Compile TypeScript
npm run build

# Run the demo
node dist/modules/memory/examples/memory-demo.js
```

## Implementation Details

### DynamoDB Schema

The memory table uses the following structure:
- Primary Key: `id` (String)
- Global Secondary Indexes:
  - `TypeIndex`: For querying by memory type
  - `AgentIndex`: For querying by agent
  - `MetadataIndex`: For efficient metadata searches

### Vector Similarity

The current implementation uses cosine similarity for vector comparisons. For production use, consider integrating with specialized vector databases like Pinecone or OpenSearch for more efficient similarity searches at scale.

### Batch Operations

Batch operations are automatically chunked to respect DynamoDB's limits:
- Write operations: 25 items per batch
- Read operations: 100 items per batch

## Best Practices

1. **Memory Management**
   - Regularly clean up old or irrelevant memories using the `vacuum()` method
   - Use appropriate TTL values in metadata for temporary memories

2. **Performance**
   - Use batch operations when working with multiple memories
   - Implement caching for frequently accessed memories
   - Consider using a vector database for large-scale deployments

3. **Error Handling**
   - Always handle potential exceptions from the repository methods
   - Use the provided `MemoryException` class for domain-specific errors

4. **Testing**
   - Write integration tests for critical memory operations
   - Mock the DynamoDB client in unit tests
   - Test edge cases and error conditions
