import { Module } from '@nestjs/common';
import { TeamsController } from './interface/http/teams.controller';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { ConfigService } from '../../config/config.service';
import { DynamoDBTeamRepository } from './infrastructure/repositories/dynamodb-team.repository';
import { TeamService } from './application/services/team.service';
import { AgentsModule } from '../agents/agents.module';
import { TEAM_REPOSITORY } from './domain/ports/team.repository';

@Module({
  imports: [
    AgentsModule, // Import AgentsModule for integration
  ],
  controllers: [TeamsController],
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
      provide: TEAM_REPOSITORY,
      useClass: DynamoDBTeamRepository,
    },
    TeamService,
  ],
  exports: [
    TeamService,
    TEAM_REPOSITORY,
  ]
})
export class TeamsModule { }
