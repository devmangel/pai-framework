import { Test } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBMemoryRepository } from '../infrastructure/repositories/dynamodb/memory.repository';
import { MemoryEntry } from '../domain/entities/memory-entry.entity';
import { v4 as uuidv4 } from 'uuid';

import { AttributeValue } from '@aws-sdk/client-dynamodb';

function marshalMetadata(metadata: any): { [key: string]: AttributeValue } {
  return Object.entries(metadata).reduce((acc, [key, value]) => {
    if (value instanceof Date) {
      acc[key] = { S: value.toISOString() };
    } else if (Array.isArray(value)) {
      acc[key] = { L: value.map(v => ({ S: v })) };
    } else if (typeof value === 'object' && value !== null) {
      acc[key] = { M: marshalMetadata(value) };
      acc[key] = { M: marshalMetadata(value) };
    } else {
      acc[key] = { S: value.toString() };
    }
    return acc;
  }, {} as { [key: string]: AttributeValue });
}

describe('Memory Integration Tests', () => {
  let repository: DynamoDBMemoryRepository;
  let dynamoDBClient: DynamoDBClient;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env',
        }),
      ],
      providers: [
        DynamoDBMemoryRepository,
        {
          provide: DynamoDBClient,
          useFactory: () => {
            return new DynamoDBClient({
              region: process.env.AWS_REGION || 'us-west-2',
              credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
              },
            });
          },
        },
      ],
    }).compile();

    repository = moduleRef.get<DynamoDBMemoryRepository>(DynamoDBMemoryRepository);
    dynamoDBClient = moduleRef.get<DynamoDBClient>(DynamoDBClient);
  });

  afterAll(async () => {
    await dynamoDBClient.destroy();
  });

  describe('Memory Operations', () => {
    let testEntry: MemoryEntry;
    const embedding = new Array(128).fill(0).map(() => Math.random());

    it('should save a memory entry', async () => {
      testEntry = MemoryEntry.create(
        uuidv4(),
        'Integration test content',
        {
          source: 'integration-test',
          timestamp: new Date(),
          context: { test: true },
          tags: ['integration'],
        },
        uuidv4(),
        embedding
      );

      const sendMock = jest.spyOn(dynamoDBClient, 'send').mockImplementation(() => 
        Promise.resolve({
          $metadata: {},
          Attributes: undefined
        })
      );

      await repository.save(testEntry);

      expect(sendMock).toHaveBeenCalledWith(expect.objectContaining({
        TableName: expect.any(String),
        Item: expect.objectContaining({
          id: { S: testEntry.getId() },
          content: { S: testEntry.getContent() },
          metadata: { M: marshalMetadata(testEntry.getMetadata()) },
          embedding: { L: testEntry.getEmbedding()?.map(v => ({ N: v.toString() })) },
          createdAt: { S: testEntry.getCreatedAt().toISOString() },
          updatedAt: { S: testEntry.getUpdatedAt().toISOString() },
        }),
      }));
    });

    it('should find similar entries', async () => {
      // Create additional entries with similar embeddings
      const similarEntry1 = MemoryEntry.create(
        uuidv4(),
        'Similar content 1',
        {
          source: 'integration-test',
          timestamp: new Date(),
          context: { test: true },
          tags: ['integration'],
        },
        uuidv4(),
        embedding.map(v => v + 0.1)
      );

      const similarEntry2 = MemoryEntry.create(
        uuidv4(),
        'Similar content 2',
        {
          source: 'integration-test',
          timestamp: new Date(),
          context: { test: true },
          tags: ['integration'],
        },
        uuidv4(),
        embedding.map(v => v - 0.1)
      );

      await repository.saveBatch([similarEntry1, similarEntry2]);

      const similarEntries = await repository.findSimilar(embedding, 2);
      expect(similarEntries.length).toBeLessThanOrEqual(2);
      expect(similarEntries[0].getEmbedding()).toBeDefined();
    });

    it('should update a memory entry', async () => {
      const updatedContent = 'Updated content';
      await repository.update(testEntry.getId(), MemoryEntry.create(
        testEntry.getId(),
        updatedContent,
        testEntry.getMetadata(),
        testEntry.getAgentId(),
        testEntry.getEmbedding()
      ));

      const updatedEntry = await repository.findById(testEntry.getId());
      expect(updatedEntry?.getContent()).toBe(updatedContent);
    });

    it('should delete a memory entry', async () => {
      await repository.delete(testEntry.getId());
      const deletedEntry = await repository.findById(testEntry.getId());
      expect(deletedEntry).toBeNull();
    });
  });

  describe('Batch Operations', () => {
    it('should perform batch operations', async () => {
      const entries = Array(3).fill(null).map((_, i) => 
        MemoryEntry.create(
          uuidv4(),
          `Batch entry ${i}`,
          {
            source: 'integration-test',
            timestamp: new Date(),
            context: { test: true },
            tags: ['integration', 'batch'],
          },
          uuidv4(),
          new Array(128).fill(0).map(() => Math.random())
        )
      );

      // Test batch save
      await repository.saveBatch(entries);
      const savedEntries = await Promise.all(
        entries.map(entry => repository.findById(entry.getId()))
      );
      expect(savedEntries.every(entry => entry !== null)).toBe(true);

      // Test batch update
      const updates = entries.map(entry => ({
        id: entry.getId(),
        entry: MemoryEntry.create(
          entry.getId(),
          `Updated ${entry.getContent()}`,
          entry.getMetadata(),
          entry.getAgentId(),
          entry.getEmbedding()
        )
      }));
      await repository.updateBatch(updates);

      const updatedEntries = await Promise.all(
        entries.map(entry => repository.findById(entry.getId()))
      );
      expect(updatedEntries.every(entry => 
        entry?.getContent().startsWith('Updated')
      )).toBe(true);

      // Test batch delete
      await repository.deleteBatch(entries.map(entry => entry.getId()));
      const deletedEntries = await Promise.all(
        entries.map(entry => repository.findById(entry.getId()))
      );
      expect(deletedEntries.every(entry => entry === null)).toBe(true);
    });
  });
});
