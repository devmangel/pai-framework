import { Test, TestingModule } from '@nestjs/testing';
import { AgentRepository } from '../domain/ports/agent.repository';
import { CreateAgentUseCase } from '../application/use-cases/create-agent.use-case';
import { Agent } from '../domain/entities/agent.entity';
import { AgentRole } from '../domain/value-objects/agent-role.vo';
import { AgentCapability, CapabilityType, ParameterType } from '../domain/value-objects/agent-capability.vo';

describe('AgentRepository', () => {
  let agentRepository: AgentRepository;
  let createAgentUseCase: CreateAgentUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: 'AgentRepository',
          useValue: {
            findByName: jest.fn(),
            save: jest.fn(),
          },
        },
        CreateAgentUseCase,
      ],
    }).compile();

    agentRepository = module.get<AgentRepository>('AgentRepository');
    createAgentUseCase = module.get<CreateAgentUseCase>(CreateAgentUseCase);
  });

  it('should create an agent', async () => {
    const createAgentDto = {
      name: 'Agent 1',
      role: {
        name: 'Role 1',
        description: 'Role description',
        responsibilities: ['Responsibility 1'],
      },
      capabilities: [
        {
          name: 'Capability 1',
          description: 'Capability description',
          type: CapabilityType.TOOL,
          parameters: [
            {
              name: 'Parameter 1',
              type: ParameterType.STRING,
              description: 'Parameter description',
              required: true,
            },
          ],
        },
      ],
      description: 'Agent description',
      goals: ['Goal 1'],
    };

    const agent = await createAgentUseCase.execute(createAgentDto);

    expect(agent).toBeInstanceOf(Agent);
    expect(agent.getName()).toBe(createAgentDto.name);
    expect(agent.getRole()).toBeInstanceOf(AgentRole);
    expect(agent.getCapabilities()[0]).toBeInstanceOf(AgentCapability);
  });
});
