import { Module } from '@nestjs/common';
import { TasksController } from './interface/http/tasks.controller';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { ConfigService } from '../../config/config.service';
import { DynamoDBTaskRepository } from './infrastructure/persistence/dynamodb/task.repository';
import { TaskServiceImpl } from './application/services/task.service';
import { AgentsModule } from '../agents/agents.module';
import { TASK_REPOSITORY } from './domain/ports/task.repository';

@Module({
  imports: [
    AgentsModule, // For agent integration
  ],
  controllers: [TasksController],
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
      provide: TASK_REPOSITORY,
      useClass: DynamoDBTaskRepository,
    },
    {
      provide: 'TaskService',
      useClass: TaskServiceImpl,
    }
  ],
  exports: [
    'TaskService',
    TASK_REPOSITORY,
  ]
})
export class TasksModule {}
