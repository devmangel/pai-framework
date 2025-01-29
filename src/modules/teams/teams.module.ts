import { Module } from '@nestjs/common';
import { TeamsController } from './teams.controller';

@Module({
  controllers: [TeamsController],
  providers: [], // TODO: Add TeamsService
  exports: [] // TODO: Export TeamsService
})
export class TeamsModule {}
