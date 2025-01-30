import { Test, TestingModule } from '@nestjs/testing';
import { LLMController } from '../interface/http/llm.controller';
import { ConfigModule } from '../../../config/config.module';

describe('LlmController', () => {
  let controller: LLMController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule],
      controllers: [LLMController],
    }).compile();

    controller = module.get<LLMController>(LLMController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
