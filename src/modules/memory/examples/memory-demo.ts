import { NestFactory } from '@nestjs/core';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBMemoryRepository } from '../infrastructure/repositories/dynamodb/memory.repository';
import { MemoryEntry } from '../domain/entities/memory-entry.entity';
import { v4 as uuidv4 } from 'uuid';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

@Module({
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
})
class MemoryDemoModule {}

async function runDemo() {
  const app = await NestFactory.createApplicationContext(MemoryDemoModule);
  const memoryRepository = app.get(DynamoDBMemoryRepository);

  try {
    console.log('Starting Memory Demo...');

    // Create a simulated agent memory
    const agentId = uuidv4();
    const embedding = new Array(128).fill(0).map(() => Math.random());

    // Store some memories
    const memories = [
      {
        content: 'User asked about weather in San Francisco',
        metadata: {
          source: 'conversation',
          timestamp: new Date(),
          context: { topic: 'weather', location: 'San Francisco' },
          tags: ['weather', 'query'],
        },
        embedding: embedding.map(v => v + Math.random() * 0.1),
      },
      {
        content: 'Temperature is 72°F with clear skies',
        metadata: {
          source: 'weather-api',
          timestamp: new Date(),
          context: { topic: 'weather', location: 'San Francisco' },
          tags: ['weather', 'response'],
        },
        embedding: embedding.map(v => v + Math.random() * 0.1),
      },
      {
        content: 'User expressed satisfaction with the weather information',
        metadata: {
          source: 'conversation',
          timestamp: new Date(),
          context: { topic: 'weather', sentiment: 'positive' },
          tags: ['feedback'],
        },
        embedding: embedding.map(v => v + Math.random() * 0.1),
      },
    ];

    console.log('Storing memories...');
    await Promise.all(
      memories.map(memory =>
        memoryRepository.save(
          MemoryEntry.create(
            uuidv4(),
            memory.content,
            memory.metadata,
            agentId,
            memory.embedding
          )
        )
      )
    );

    // Retrieve similar memories
    console.log('\nRetrieving similar memories...');
    const similarMemories = await memoryRepository.findSimilar(embedding, 2);
    console.log('Similar memories:');
    similarMemories.forEach(memory => {
      console.log(`- ${memory.getContent()}`);
      console.log(`  Tags: ${memory.getMetadata().tags.join(', ')}`);
      console.log(`  Context: ${JSON.stringify(memory.getMetadata().context)}\n`);
    });

    // Search by metadata
    console.log('Searching memories with weather tag...');
    const weatherMemories = await memoryRepository.findByMetadata({
      tags: ['weather'],
    });
    console.log('Weather-related memories:');
    weatherMemories.forEach(memory => {
      console.log(`- ${memory.getContent()}`);
    });

    // Clean up
    console.log('\nCleaning up...');
    await memoryRepository.deleteByAgent(agentId);
    console.log('Demo completed successfully!');

  } catch (error) {
    console.error('Error during demo:', error);
  } finally {
    await app.close();
  }
}

// Run the demo if this file is executed directly
if (require.main === module) {
  runDemo().catch(console.error);
}
