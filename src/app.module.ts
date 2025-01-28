import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { AgentsModule } from './modules/agents/agents.module';
import { LLMModule } from './modules/llm/llm.module';

@Module({
  imports: [
    ConfigModule,
    AgentsModule,
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
