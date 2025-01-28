import { Agent } from '../../domain/entities/agent.entity';
import { AgentRole } from '../../domain/value-objects/agent-role.vo';
import { 
  AgentCapability, 
  CapabilityType, 
  ParameterType,
  CapabilityParameter 
} from '../../domain/value-objects/agent-capability.vo';
import { AgentRepository, DuplicateAgentError } from '../../domain/ports/agent.repository';

export interface CreateAgentDto {
  name: string;
  role: {
    name: string;
    description: string;
    responsibilities: string[];
  };
  capabilities: Array<{
    name: string;
    description: string;
    type: keyof typeof CapabilityType;
    parameters: Array<{
      name: string;
      type: keyof typeof ParameterType;
      description?: string;
      required: boolean;
      defaultValue?: any;
    }>;
  }>;
  description: string;
  goals: string[];
}

export class CreateAgentUseCase {
  constructor(private readonly agentRepository: AgentRepository) {}

  async execute(dto: CreateAgentDto): Promise<Agent> {
    // Check for existing agent with same name
    const existingAgents = await this.agentRepository.findByName(dto.name);
    if (existingAgents.length > 0) {
      throw new DuplicateAgentError(dto.name);
    }

    // Create role
    const role = new AgentRole(
      dto.role.name,
      dto.role.description,
      dto.role.responsibilities
    );

    // Create capabilities
    const capabilities = dto.capabilities.map(cap => {
      // Convert string type to CapabilityType enum
      const capabilityType = CapabilityType[cap.type];
      if (!capabilityType) {
        throw new Error(`Invalid capability type: ${cap.type}`);
      }

      // Convert parameter types from string to ParameterType enum
      const parameters: CapabilityParameter[] = cap.parameters.map(param => {
        const parameterType = ParameterType[param.type];
        if (!parameterType) {
          throw new Error(`Invalid parameter type: ${param.type}`);
        }

        return {
          name: param.name,
          type: parameterType,
          description: param.description,
          required: param.required,
          defaultValue: param.defaultValue,
        };
      });

      return new AgentCapability(
        cap.name,
        cap.description,
        capabilityType,
        parameters
      );
    });

    // Create agent
    const agent = Agent.create(
      dto.name,
      role,
      capabilities,
      dto.description,
      dto.goals
    );

    // Save agent
    await this.agentRepository.save(agent);

    return agent;
  }
}

// Factory for creating the use case with its dependencies
export class CreateAgentUseCaseFactory {
  static create(agentRepository: AgentRepository): CreateAgentUseCase {
    return new CreateAgentUseCase(agentRepository);
  }
}
