import { Module } from '@nestjs/common';
import { TeamService } from './application/services/team.service';
import { DynamoDBTeamRepository } from './infrastructure/repositories/dynamodb-team.repository';
import { TEAM_REPOSITORY } from './domain/ports/team.repository';
import { TeamsController } from './interface/http/teams.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
  ],
  controllers: [TeamsController],
  providers: [
    TeamService,
    {
      provide: TEAM_REPOSITORY,
      useClass: DynamoDBTeamRepository,
    },
  ],
  exports: [TeamService],
})
export class TeamsModule {}
