import { Injectable } from '@nestjs/common';
import { 
  DynamoDBClient, 
  PutItemCommand, 
  GetItemCommand, 
  QueryCommand, 
  DeleteItemCommand, 
  ScanCommand, 
  UpdateItemCommand, 
  DescribeTableCommand,
  BatchWriteItemCommand,
  BatchGetItemCommand,
  TransactWriteItemsCommand
} from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { MemoryEntry, MemoryMetadata } from '../../../domain/entities/memory-entry.entity';
import { MemoryType } from '../../../domain/enums/memory-type.enum';
import { MemoryRepository, MemoryFilter } from '../../../domain/ports/memory.repository';
import { MemoryException } from '../../../domain/exceptions/memory.exception';

@Injectable()
export class DynamoDBMemoryRepository implements MemoryRepository {
  private readonly tableName = 'Memory';

  constructor(private readonly dynamoDBClient: DynamoDBClient) {}

  async save(entry: MemoryEntry): Promise<void> {
    const item = this.toItem(entry);
    
    try {
      await this.dynamoDBClient.send(
        new PutItemCommand({
          TableName: this.tableName,
          Item: marshall(item),
          ConditionExpression: 'attribute_not_exists(id)',
        })
      );
    } catch (error) {
      if (error.name === 'ConditionalCheckFailedException') {
        throw MemoryException.storageError(`Memory entry with ID ${entry.getId()} already exists`);
      }
      throw MemoryException.storageError(error.message);
    }
  }

  async update(id: string, entry: Partial<MemoryEntry>): Promise<void> {
    const updateExpressions: string[] = [];
    const expressionAttributeNames: Record<string, string> = {};
    const expressionAttributeValues: Record<string, any> = {};

    Object.entries(this.toItem(entry as MemoryEntry)).forEach(([key, value]) => {
      if (key !== 'id') {
        updateExpressions.push(`#${key} = :${key}`);
        expressionAttributeNames[`#${key}`] = key;
        expressionAttributeValues[`:${key}`] = value;
      }
    });

    try {
      await this.dynamoDBClient.send(
        new UpdateItemCommand({
          TableName: this.tableName,
          Key: marshall({ id }),
          UpdateExpression: `SET ${updateExpressions.join(', ')}`,
          ExpressionAttributeNames: expressionAttributeNames,
          ExpressionAttributeValues: marshall(expressionAttributeValues),
          ConditionExpression: 'attribute_exists(id)',
        })
      );
    } catch (error) {
      if (error.name === 'ConditionalCheckFailedException') {
        throw MemoryException.notFoundError(`Memory entry with ID ${id} not found`);
      }
      throw MemoryException.storageError(error.message);
    }
  }

  async exists(id: string): Promise<boolean> {
    const result = await this.dynamoDBClient.send(
      new GetItemCommand({
        TableName: this.tableName,
        Key: marshall({ id }),
        ProjectionExpression: 'id',
      })
    );
    return !!result.Item;
  }

  async findById(id: string): Promise<MemoryEntry | null> {
    const result = await this.dynamoDBClient.send(
      new GetItemCommand({
        TableName: this.tableName,
        Key: marshall({ id }),
      })
    );

    if (!result.Item) {
      return null;
    }

    return this.toEntity(unmarshall(result.Item));
  }

  async findByType(type: MemoryType): Promise<MemoryEntry[]> {
    const result = await this.dynamoDBClient.send(
      new QueryCommand({
        TableName: this.tableName,
        IndexName: 'TypeIndex',
        KeyConditionExpression: '#type = :type',
        ExpressionAttributeNames: {
          '#type': 'type',
        },
        ExpressionAttributeValues: marshall({
          ':type': type,
        }),
      })
    );

    return (result.Items || []).map(item => this.toEntity(unmarshall(item)));
  }

  async findByFilter(filter: MemoryFilter): Promise<MemoryEntry[]> {
    let filterExpression: string[] = [];
    let expressionAttributeNames: Record<string, string> = {};
    let expressionAttributeValues: Record<string, any> = {};

    if (filter.type) {
      filterExpression.push('#type = :type');
      expressionAttributeNames['#type'] = 'type';
      expressionAttributeValues[':type'] = filter.type;
    }

    if (filter.agentId) {
      filterExpression.push('agentId = :agentId');
      expressionAttributeValues[':agentId'] = filter.agentId;
    }

    if (filter.fromDate) {
      filterExpression.push('createdAt >= :fromDate');
      expressionAttributeValues[':fromDate'] = filter.fromDate.toISOString();
    }

    if (filter.toDate) {
      filterExpression.push('createdAt <= :toDate');
      expressionAttributeValues[':toDate'] = filter.toDate.toISOString();
    }

    if (filter.metadata) {
      Object.entries(filter.metadata).forEach(([key, value]) => {
        const attrKey = `metadata_${key}`;
        filterExpression.push(`metadata.#${attrKey} = :${attrKey}`);
        expressionAttributeNames[`#${attrKey}`] = key;
        expressionAttributeValues[`:${attrKey}`] = value;
      });
    }

    const result = await this.dynamoDBClient.send(
      new ScanCommand({
        TableName: this.tableName,
        FilterExpression: filterExpression.length > 0 ? filterExpression.join(' AND ') : undefined,
        ExpressionAttributeNames: Object.keys(expressionAttributeNames).length > 0 ? expressionAttributeNames : undefined,
        ExpressionAttributeValues: Object.keys(expressionAttributeValues).length > 0 ? marshall(expressionAttributeValues) : undefined,
      })
    );

    return (result.Items || []).map(item => this.toEntity(unmarshall(item)));
  }

  async findByContent(content: string, similarity: number): Promise<MemoryEntry[]> {
    // Note: For semantic search, we'll need to:
    // 1. Generate embedding for the search content
    // 2. Find entries with similar embeddings
    // This is a simplified version that uses string matching
    const result = await this.dynamoDBClient.send(
      new ScanCommand({
        TableName: this.tableName,
        FilterExpression: 'contains(content, :content)',
        ExpressionAttributeValues: marshall({
          ':content': content,
        }),
      })
    );

    return (result.Items || []).map(item => this.toEntity(unmarshall(item)));
  }

  async findSimilar(embedding: number[], limit?: number): Promise<MemoryEntry[]> {
    // Note: This is a simplified implementation.
    // In production, you would want to use a vector similarity search
    // possibly with an external service like Pinecone or Milvus
    const result = await this.dynamoDBClient.send(
      new ScanCommand({
        TableName: this.tableName,
        FilterExpression: 'attribute_exists(embedding)',
      })
    );

    const entries = (result.Items || [])
      .map(item => this.toEntity(unmarshall(item)))
      .filter(entry => entry.getEmbedding())
      .map(entry => ({
        entry,
        similarity: this.cosineSimilarity(embedding, entry.getEmbedding()!),
      }))
      .sort((a, b) => b.similarity - a.similarity);

    return entries
      .slice(0, limit || entries.length)
      .map(({ entry }) => entry);
  }

  async updateEmbedding(id: string, embedding: number[]): Promise<void> {
    try {
      await this.dynamoDBClient.send(
        new UpdateItemCommand({
          TableName: this.tableName,
          Key: marshall({ id }),
          UpdateExpression: 'SET embedding = :embedding',
          ExpressionAttributeValues: marshall({
            ':embedding': embedding,
          }),
          ConditionExpression: 'attribute_exists(id)',
        })
      );
    } catch (error) {
      if (error.name === 'ConditionalCheckFailedException') {
        throw MemoryException.notFoundError(`Memory entry with ID ${id} not found`);
      }
      throw MemoryException.storageError(error.message);
    }
  }

  async findByEmbeddingRange(
    embedding: number[],
    minSimilarity: number,
    maxSimilarity: number
  ): Promise<MemoryEntry[]> {
    // Note: This is a simplified implementation.
    // In production, you would want to use a vector similarity search service
    const result = await this.dynamoDBClient.send(
      new ScanCommand({
        TableName: this.tableName,
        FilterExpression: 'attribute_exists(embedding)',
      })
    );

    const entries = (result.Items || [])
      .map(item => this.toEntity(unmarshall(item)))
      .filter(entry => entry.getEmbedding())
      .map(entry => ({
        entry,
        similarity: this.cosineSimilarity(embedding, entry.getEmbedding()!),
      }))
      .filter(({ similarity }) => 
        similarity >= minSimilarity && similarity <= maxSimilarity
      )
      .sort((a, b) => b.similarity - a.similarity);

    return entries.map(({ entry }) => entry);
  }

  async findByAgent(agentId: string, type?: MemoryType): Promise<MemoryEntry[]> {
    let keyConditionExpression = 'agentId = :agentId';
    let filterExpression = undefined;
    const expressionAttributeValues: Record<string, any> = {
      ':agentId': agentId,
    };

    if (type) {
      filterExpression = '#type = :type';
      expressionAttributeValues[':type'] = type;
    }

    const result = await this.dynamoDBClient.send(
      new QueryCommand({
        TableName: this.tableName,
        IndexName: 'AgentIndex',
        KeyConditionExpression: keyConditionExpression,
        FilterExpression: filterExpression,
        ExpressionAttributeNames: type ? { '#type': 'type' } : undefined,
        ExpressionAttributeValues: marshall(expressionAttributeValues),
      })
    );

    return (result.Items || []).map(item => this.toEntity(unmarshall(item)));
  }

  async deleteByAgent(agentId: string, type?: MemoryType): Promise<void> {
    const entries = await this.findByAgent(agentId, type);
    await this.deleteBatch(entries.map(entry => entry.getId()));
  }

  async findByMetadata(metadata: Partial<MemoryMetadata>): Promise<MemoryEntry[]> {
    const filterExpressions: string[] = [];
    const expressionAttributeNames: Record<string, string> = {};
    const expressionAttributeValues: Record<string, any> = {};

    Object.entries(metadata).forEach(([key, value], index) => {
      filterExpressions.push(`metadata.#key${index} = :value${index}`);
      expressionAttributeNames[`#key${index}`] = key;
      expressionAttributeValues[`:value${index}`] = value;
    });

    const result = await this.dynamoDBClient.send(
      new ScanCommand({
        TableName: this.tableName,
        FilterExpression: filterExpressions.join(' AND '),
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: marshall(expressionAttributeValues),
      })
    );

    return (result.Items || []).map(item => this.toEntity(unmarshall(item)));
  }

  async saveBatch(entries: MemoryEntry[]): Promise<void> {
    const batchSize = 25; // DynamoDB batch write limit
    const batches = [];
    
    for (let i = 0; i < entries.length; i += batchSize) {
      const batch = entries.slice(i, i + batchSize).map(entry => ({
        PutRequest: {
          Item: marshall(this.toItem(entry))
        }
      }));
      
      batches.push(
        this.dynamoDBClient.send(new BatchWriteItemCommand({
          RequestItems: {
            [this.tableName]: batch
          }
        }))
      );
    }

    await Promise.all(batches);
  }

  async updateBatch(updates: Array<{ id: string; entry: Partial<MemoryEntry> }>): Promise<void> {
    const batchSize = 25;
    const batches = [];

    for (let i = 0; i < updates.length; i += batchSize) {
      const batchUpdates = updates.slice(i, i + batchSize);
      const transactItems = batchUpdates.map(({ id, entry }) => ({
        Update: {
          TableName: this.tableName,
          Key: marshall({ id }),
          UpdateExpression: this.buildUpdateExpression(entry),
          ExpressionAttributeNames: this.buildExpressionAttributeNames(entry),
          ExpressionAttributeValues: marshall(this.buildExpressionAttributeValues(entry))
        }
      }));

      batches.push(
        this.dynamoDBClient.send(new TransactWriteItemsCommand({
          TransactItems: transactItems
        }))
      );
    }

    await Promise.all(batches);
  }

  async findByIds(ids: string[]): Promise<(MemoryEntry | null)[]> {
    const batchSize = 100; // DynamoDB batch get limit
    const results: (MemoryEntry | null)[] = new Array(ids.length).fill(null);
    
    for (let i = 0; i < ids.length; i += batchSize) {
      const batchIds = ids.slice(i, i + batchSize);
      const response = await this.dynamoDBClient.send(new BatchGetItemCommand({
        RequestItems: {
          [this.tableName]: {
            Keys: batchIds.map(id => marshall({ id }))
          }
        }
      }));

      const responses = response.Responses?.[this.tableName] || [];
      if (responses.length > 0) {
        const items = responses;
        items.forEach(item => {
          const entry = this.toEntity(unmarshall(item));
          const index = ids.indexOf(entry.getId());
          if (index !== -1) {
            results[index] = entry;
          }
        });
      }
    }

    return results;
  }

  async deleteBatch(ids: string[]): Promise<void> {
    const batchSize = 25;
    const batches = [];

    for (let i = 0; i < ids.length; i += batchSize) {
      const batch = ids.slice(i, i + batchSize).map(id => ({
        DeleteRequest: {
          Key: marshall({ id })
        }
      }));

      batches.push(
        this.dynamoDBClient.send(new BatchWriteItemCommand({
          RequestItems: {
            [this.tableName]: batch
          }
        }))
      );
    }

    await Promise.all(batches);
  }

  private buildUpdateExpression(entry: Partial<MemoryEntry>): string {
    const item = this.toItem(entry as MemoryEntry);
    const expressions: string[] = [];
    
    Object.keys(item).forEach(key => {
      if (key !== 'id') {
        expressions.push(`#${key} = :${key}`);
      }
    });

    return `SET ${expressions.join(', ')}`;
  }

  private buildExpressionAttributeNames(entry: Partial<MemoryEntry>): Record<string, string> {
    const item = this.toItem(entry as MemoryEntry);
    const names: Record<string, string> = {};
    
    Object.keys(item).forEach(key => {
      if (key !== 'id') {
        names[`#${key}`] = key;
      }
    });

    return names;
  }

  private buildExpressionAttributeValues(entry: Partial<MemoryEntry>): Record<string, any> {
    const item = this.toItem(entry as MemoryEntry);
    const values: Record<string, any> = {};
    
    Object.keys(item).forEach(key => {
      if (key !== 'id') {
        values[`:${key}`] = item[key];
      }
    });

    return values;
  }

  async delete(id: string): Promise<void> {
    try {
      await this.dynamoDBClient.send(
        new DeleteItemCommand({
          TableName: this.tableName,
          Key: marshall({ id }),
          ConditionExpression: 'attribute_exists(id)',
        })
      );
    } catch (error) {
      if (error.name === 'ConditionalCheckFailedException') {
        throw MemoryException.notFoundError(`Memory entry with ID ${id} not found`);
      }
      throw MemoryException.storageError(error.message);
    }
  }

  async clear(type?: MemoryType): Promise<void> {
    if (type) {
      const entries = await this.findByType(type);
      await this.deleteBatch(entries.map(entry => entry.getId()));
    } else {
      // Note: This is a simplified implementation. In production,
      // you might want to use a more efficient way to clear all entries
      const result = await this.dynamoDBClient.send(
        new ScanCommand({
          TableName: this.tableName,
          ProjectionExpression: 'id',
        })
      );

      const ids = (result.Items || []).map(item => unmarshall(item).id);
      await this.deleteBatch(ids);
    }
  }

  async count(filter?: MemoryFilter): Promise<number> {
    const entries = await this.findByFilter(filter || {});
    return entries.length;
  }

  async vacuum(): Promise<void> {
    // In DynamoDB, this is a no-op as DynamoDB handles storage optimization automatically
    return Promise.resolve();
  }

  async optimize(): Promise<void> {
    // In DynamoDB, this is a no-op as DynamoDB handles optimization automatically
    return Promise.resolve();
  }

  async backup(): Promise<string> {
    // Note: This is a simplified implementation.
    // In production, you would want to use DynamoDB's backup features
    const result = await this.dynamoDBClient.send(
      new ScanCommand({
        TableName: this.tableName,
      })
    );

    return JSON.stringify(result.Items?.map(item => unmarshall(item)) || []);
  }

  async restore(backup: string): Promise<void> {
    const items = JSON.parse(backup);
    await this.clear();
    await Promise.all(
      items.map(item => this.save(this.toEntity(item)))
    );
  }

  async transaction<T>(operation: () => Promise<T>): Promise<T> {
    // Note: DynamoDB supports transactions, but for simplicity,
    // we're just executing the operation directly.
    // In production, you would want to use DynamoDB's TransactWriteItems
    return operation();
  }

  async getStorageStats(): Promise<{
    totalSize: number;
    entriesCount: Record<MemoryType, number>;
    lastUpdate: Date;
  }> {
    try {
      // Get table information
      const tableInfo = await this.dynamoDBClient.send(
        new DescribeTableCommand({
          TableName: this.tableName,
        })
      );

      // Get counts by type
      const entriesCount: Record<MemoryType, number> = {} as Record<MemoryType, number>;
      for (const type of Object.values(MemoryType)) {
        const entries = await this.findByType(type);
        entriesCount[type] = entries.length;
      }

      // Calculate total size (approximate)
      const result = await this.dynamoDBClient.send(
        new ScanCommand({
          TableName: this.tableName,
        })
      );

      const items = result.Items || [];
      const totalSize = items.reduce((size, item) => {
        const entry = unmarshall(item);
        // Rough size estimation in bytes
        return size + Buffer.from(JSON.stringify(entry)).length;
      }, 0);

      return {
        totalSize,
        entriesCount,
        lastUpdate: new Date(tableInfo.Table?.TableStatus === 'ACTIVE' ? Date.now() : 0),
      };
    } catch (error) {
      throw MemoryException.storageError('Failed to get storage stats: ' + error.message);
    }
  }

  private toItem(entry: MemoryEntry): Record<string, any> {
    return {
      id: entry.getId(),
      content: entry.getContent(),
      metadata: entry.getMetadata(),
      agentId: entry.getAgentId(),
      embedding: entry.getEmbedding(),
      createdAt: entry.getCreatedAt().toISOString(),
      updatedAt: entry.getUpdatedAt().toISOString(),
    };
  }

  private toEntity(item: Record<string, any>): MemoryEntry {
    return MemoryEntry.create(
      item.id,
      item.content,
      item.metadata,
      item.agentId,
      item.embedding,
    );
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) {
      throw new Error('Vectors must have the same length');
    }

    const dotProduct = a.reduce((sum, _, i) => sum + a[i] * b[i], 0);
    const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));

    if (magnitudeA === 0 || magnitudeB === 0) {
      return 0;
    }

    const similarity = dotProduct / (magnitudeA * magnitudeB);
    return Math.max(-1, Math.min(1, similarity)); // Ensure result is between -1 and 1
  }

  private async findSimilarWithPagination(
    embedding: number[],
    limit?: number,
    lastEvaluatedKey?: Record<string, any>
  ): Promise<{ entries: MemoryEntry[]; lastEvaluatedKey?: Record<string, any> }> {
    const pageSize = 100;
    const result = await this.dynamoDBClient.send(
      new ScanCommand({
        TableName: this.tableName,
        FilterExpression: 'attribute_exists(embedding)',
        Limit: pageSize,
        ExclusiveStartKey: lastEvaluatedKey,
      })
    );

    const entries = (result.Items || [])
      .map(item => this.toEntity(unmarshall(item)))
      .filter(entry => entry.getEmbedding())
      .map(entry => ({
        entry,
        similarity: this.cosineSimilarity(embedding, entry.getEmbedding()!),
      }))
      .sort((a, b) => b.similarity - a.similarity);

    return {
      entries: entries.slice(0, limit).map(({ entry }) => entry),
      lastEvaluatedKey: result.LastEvaluatedKey,
    };
  }
}
