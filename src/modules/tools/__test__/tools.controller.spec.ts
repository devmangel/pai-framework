import { Test, TestingModule } from '@nestjs/testing';
import { ToolsController } from '../interface/http/tools.controller';
import { ToolService } from '../application/services/tool-application.service';

describe('ToolsController', () => {
  let controller: ToolsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ToolsController],
      providers: [
        {
          provide: ToolService,
          useValue: {}, // Mock implementation
        },
      ],
    }).compile();

    controller = module.get<ToolsController>(ToolsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // Add more tests here
});
