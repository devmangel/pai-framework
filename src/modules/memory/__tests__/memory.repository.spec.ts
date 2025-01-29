import { Test } from '@nestjs/testing';
import { 
  DynamoDBClient,
  PutItemCommandOutput,
  ScanCommandOutput,
  BatchWriteItemCommandOutput,
  TransactWriteItemsCommandOutput,
  AttributeValue
} from '@aws-sdk/client-dynamodb';
import { DynamoDBMemoryRepository } from '../infrastructure/repositories/dynamodb/memory.repository';
import { MemoryEntry } from '../domain/entities/memory-entry.entity';
import { v4 as uuidv4 } from 'uuid';

describe('DynamoDBMemoryRepository', () => {
  let repository: DynamoDBMemoryRepository;
  let dynamoDBClient: DynamoDBClient;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        DynamoDBMemoryRepository,
        {
          provide: DynamoDBClient,
          useValue: {
            send: jest.fn().mockImplementation(() => Promise.resolve({})),
          },
        },
      ],
    }).compile();

    repository = moduleRef.get<DynamoDBMemoryRepository>(DynamoDBMemoryRepository);
    dynamoDBClient = moduleRef.get<DynamoDBClient>(DynamoDBClient);
  });

  describe('save', () => {
    it('should save a memory entry', async () => {
      const entry = createTestMemoryEntry();
      const sendMock = jest.spyOn(dynamoDBClient, 'send').mockImplementation(() => 
        Promise.resolve({
          $metadata: {},
          Attributes: undefined
        } as PutItemCommandOutput)
      );

      await repository.save(entry);

      expect(sendMock).toHaveBeenCalledWith(expect.objectContaining({
        TableName: expect.any(String),
        Item: expect.objectContaining({
          id: { S: entry.getId() },
          content: { S: entry.getContent() },
          metadata: { M: marshalMetadata(entry.getMetadata()) },
          embedding: { L: entry.getEmbedding()?.map(v => ({ N: v.toString() })) },
          createdAt: { S: entry.getCreatedAt().toISOString() },
          updatedAt: { S: entry.getUpdatedAt().toISOString() },
        }),
      }));
    });
  });

  describe('findSimilar', () => {
    it('should find similar entries based on embeddings', async () => {
      const embedding = new Array(128).fill(0).map(() => Math.random());
      const entries = [
        createTestMemoryEntry('Test 1', embedding),
        createTestMemoryEntry('Test 2', embedding.map(v => v + 0.1)),
        createTestMemoryEntry('Test 3', embedding.map(v => v - 0.1)),
      ];

      const mockItems = entries.map(entry => ({
        id: { S: entry.getId() },
        content: { S: entry.getContent() },
        metadata: { M: marshalMetadata(entry.getMetadata()) },
        embedding: { L: entry.getEmbedding()?.map(v => ({ N: v.toString() })) },
        createdAt: { S: entry.getCreatedAt().toISOString() },
        updatedAt: { S: entry.getUpdatedAt().toISOString() },
      }));

      jest.spyOn(dynamoDBClient, 'send').mockImplementation(() => 
        Promise.resolve({
          $metadata: {},
          Items: mockItems
        } as ScanCommandOutput)
      );

      const result = await repository.findSimilar(embedding, 2);

      expect(result).toHaveLength(2);
      expect(result[0].getId()).toBeDefined();
      expect(result[1].getId()).toBeDefined();
    });
  });

  describe('batch operations', () => {
    it('should save multiple entries in batch', async () => {
      const entries = [
        createTestMemoryEntry('Batch 1'),
        createTestMemoryEntry('Batch 2'),
        createTestMemoryEntry('Batch 3'),
      ];
      const sendMock = jest.spyOn(dynamoDBClient, 'send').mockImplementation(() => 
        Promise.resolve({
          $metadata: {},
          UnprocessedItems: {}
        } as BatchWriteItemCommandOutput)
      );

      await repository.saveBatch(entries);

      expect(sendMock).toHaveBeenCalled();
    });

    it('should update multiple entries in batch', async () => {
      const updates = [
        { 
          id: uuidv4(), 
          entry: createTestMemoryEntry('Updated 1') 
        },
        { 
          id: uuidv4(), 
          entry: createTestMemoryEntry('Updated 2')
        },
      ];
      const sendMock = jest.spyOn(dynamoDBClient, 'send').mockImplementation(() => 
        Promise.resolve({
          $metadata: {}
        } as TransactWriteItemsCommandOutput)
      );

      await repository.updateBatch(updates);

      expect(sendMock).toHaveBeenCalled();
    });
  });
});

function createTestMemoryEntry(content: string = 'Test content', embedding?: number[]): MemoryEntry {
  return MemoryEntry.create(
    uuidv4(),
    content,
    {
      source: 'test',
      timestamp: new Date(),
      context: { test: true },
      tags: ['test'],
    },
    uuidv4(),
    embedding,
  );
}

function marshalMetadata(metadata: any): { [key: string]: AttributeValue } {
  return Object.entries(metadata).reduce((acc, [key, value]) => {
    if (value instanceof Date) {
      acc[key] = { S: value.toISOString() };
    } else if (Array.isArray(value)) {
      acc[key] = { L: value.map(v => ({ S: v })) };
    } else if (typeof value === 'object') {
      acc[key] = { M: marshalMetadata(value) };
    } else {
      acc[key] = { S: value.toString() };
    }
    return acc;
  }, {} as { [key: string]: AttributeValue });
}
