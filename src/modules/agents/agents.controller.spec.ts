import { Test, TestingModule } from '@nestjs/testing';
import { AgentsController } from './agents.controller';

describe('AgentsController', () => {
  let controller: AgentsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AgentsController],
    }).compile();

    controller = module.get<AgentsController>(AgentsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
