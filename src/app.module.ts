import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { AgentsModule } from './modules/agents/agents.module';

@Module({
  imports: [
    ConfigModule,
    AgentsModule,
  ],
})
export class AppModule {}
