export class AgentCapability {
  constructor(
    private readonly name: string,
    private readonly description: string,
    private readonly type: CapabilityType,
    private readonly parameters: CapabilityParameter[],
  ) {
    this.validateCapability();
  }

  private validateCapability(): void {
    if (!this.name || typeof this.name !== 'string' || this.name.trim().length === 0) {
      throw new Error('Capability name must be a non-empty string');
    }
    if (!this.description || typeof this.description !== 'string') {
      throw new Error('Capability description must be a non-empty string');
    }
    if (!Object.values(CapabilityType).includes(this.type)) {
      throw new Error('Invalid capability type');
    }
    if (!Array.isArray(this.parameters)) {
      throw new Error('Parameters must be an array');
    }
    this.parameters.forEach(param => {
      if (!param.name || typeof param.name !== 'string' || param.name.trim().length === 0) {
        throw new Error('Parameter name must be a non-empty string');
      }
      if (!Object.values(ParameterType).includes(param.type)) {
        throw new Error('Invalid parameter type');
      }
    });
  }

  public getName(): string {
    return this.name;
  }

  public getDescription(): string {
    return this.description;
  }

  public getType(): CapabilityType {
    return this.type;
  }

  public getParameters(): CapabilityParameter[] {
    return [...this.parameters];
  }

  public equals(other: AgentCapability): boolean {
    return (
      this.name === other.name &&
      this.type === other.type &&
      this.parameters.length === other.parameters.length &&
      this.parameters.every((param, i) => 
        param.name === other.parameters[i].name &&
        param.type === other.parameters[i].type &&
        param.required === other.parameters[i].required
      )
    );
  }

  public toJSON() {
    return {
      name: this.name,
      description: this.description,
      type: this.type,
      parameters: this.parameters,
    };
  }
}

export enum CapabilityType {
  TOOL = 'TOOL',
  SKILL = 'SKILL',
  INTEGRATION = 'INTEGRATION',
  COMMUNICATION = 'COMMUNICATION',
}

export enum ParameterType {
  STRING = 'STRING',
  NUMBER = 'NUMBER',
  BOOLEAN = 'BOOLEAN',
  OBJECT = 'OBJECT',
  ARRAY = 'ARRAY',
}

export interface CapabilityParameter {
  name: string;
  type: ParameterType;
  description?: string;
  required: boolean;
  defaultValue?: any;
}

// Common capabilities
export namespace CommonCapabilities {
  export const WEB_SEARCH = new AgentCapability(
    'Web Search',
    'Ability to search and retrieve information from the web',
    CapabilityType.TOOL,
    [
      {
        name: 'query',
        type: ParameterType.STRING,
        description: 'Search query',
        required: true,
      },
      {
        name: 'maxResults',
        type: ParameterType.NUMBER,
        description: 'Maximum number of results to return',
        required: false,
        defaultValue: 5,
      },
    ]
  );

  export const FILE_OPERATION = new AgentCapability(
    'File Operation',
    'Ability to read and write files',
    CapabilityType.TOOL,
    [
      {
        name: 'path',
        type: ParameterType.STRING,
        description: 'File path',
        required: true,
      },
      {
        name: 'operation',
        type: ParameterType.STRING,
        description: 'Operation type (read/write)',
        required: true,
      },
      {
        name: 'content',
        type: ParameterType.STRING,
        description: 'Content to write (for write operation)',
        required: false,
      },
    ]
  );

  export const API_INTEGRATION = new AgentCapability(
    'API Integration',
    'Ability to interact with external APIs',
    CapabilityType.INTEGRATION,
    [
      {
        name: 'endpoint',
        type: ParameterType.STRING,
        description: 'API endpoint',
        required: true,
      },
      {
        name: 'method',
        type: ParameterType.STRING,
        description: 'HTTP method',
        required: true,
      },
      {
        name: 'body',
        type: ParameterType.OBJECT,
        description: 'Request body',
        required: false,
      },
    ]
  );

  export const TEAM_COMMUNICATION = new AgentCapability(
    'Team Communication',
    'Ability to communicate with other agents in the team',
    CapabilityType.COMMUNICATION,
    [
      {
        name: 'recipient',
        type: ParameterType.STRING,
        description: 'Recipient agent ID',
        required: true,
      },
      {
        name: 'message',
        type: ParameterType.STRING,
        description: 'Message content',
        required: true,
      },
      {
        name: 'priority',
        type: ParameterType.STRING,
        description: 'Message priority',
        required: false,
        defaultValue: 'normal',
      },
    ]
  );
}
