import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { AgentsModule } from './modules/agents/agents.module';
import { LLMModule } from './modules/llm/llm.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { TeamsModule } from './modules/teams/teams.module';
import { MemoryModule } from './modules/memory/memory.module';

@Module({
  imports: [
    ConfigModule,
    AgentsModule,
    TasksModule,
    TeamsModule,
    MemoryModule,
    LLMModule.forRoot({
      provider: 'openai',
      config: {
        maxTokens: 2048,
        temperature: 0.7,
        topP: 1,
        frequencyPenalty: 0,
        presencePenalty: 0,
        timeout: 30000,
      },
    }),
  ],
})
export class AppModule {}
