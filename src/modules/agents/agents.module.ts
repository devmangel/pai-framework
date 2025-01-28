import { Module } from '@nestjs/common';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { AgentsController } from './interface/http/agents.controller';
import { DynamoDBAgentRepository } from './infrastructure/persistence/dynamodb/agent.repository';
import { CreateAgentUseCase } from './application/use-cases/create-agent.use-case';
import { AgentRepository } from './domain/ports/agent.repository';
import { ConfigService } from '../../config/config.service';

@Module({
  imports: [],
  controllers: [AgentsController],
  providers: [
    {
      provide: DynamoDBClient,
      useFactory: (configService: ConfigService) => {
        const awsConfig = configService.awsConfig;
        const dynamoConfig = configService.dynamoDBConfig;
        
        return new DynamoDBClient({
          region: awsConfig.region,
          credentials: {
            accessKeyId: awsConfig.credentials.accessKeyId,
            secretAccessKey: awsConfig.credentials.secretAccessKey,
          },
          ...(dynamoConfig.endpoint && {
            endpoint: dynamoConfig.endpoint,
          }),
        });
      },
      inject: [ConfigService],
    },
    {
      provide: 'AgentRepository',
      useClass: DynamoDBAgentRepository,
    },
    {
      provide: CreateAgentUseCase,
      useFactory: (repository: AgentRepository) => {
        return new CreateAgentUseCase(repository);
      },
      inject: ['AgentRepository'],
    },
  ],
  exports: ['AgentRepository', CreateAgentUseCase],
})
export class AgentsModule {}
