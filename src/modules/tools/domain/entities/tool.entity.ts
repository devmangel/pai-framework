import { ToolType, ToolCategory } from '../enums/tool-type.enum';

export interface ToolArgument {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description: string;
  required: boolean;
  default?: any;
}

export interface ToolMetadata {
  version: string;
  author?: string;
  license?: string;
  tags?: string[];
  documentation?: string;
}

export class Tool {
  private readonly id: string;
  private readonly name: string;
  private readonly description: string;
  private readonly type: ToolType;
  private readonly category: ToolCategory;
  private readonly args: ToolArgument[];
  private readonly functionName: string;
  private readonly metadata: ToolMetadata;
  private readonly createdAt: Date;
  private readonly updatedAt: Date;

  constructor(
    id: string,
    name: string,
    description: string,
    type: ToolType,
    category: ToolCategory,
    args: ToolArgument[],
    functionName: string,
    metadata: ToolMetadata,
  ) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.type = type;
    this.category = category;
    this.args = args;
    this.functionName = functionName;
    this.metadata = metadata;
    this.createdAt = new Date();
    this.updatedAt = new Date();
    this.validate();
  }

  private validate(): void {
    if (!this.id || typeof this.id !== 'string') {
      throw new Error('Tool ID must be a non-empty string');
    }
    if (!this.name || typeof this.name !== 'string') {
      throw new Error('Tool name must be a non-empty string');
    }
    if (!this.description || typeof this.description !== 'string') {
      throw new Error('Tool description must be a non-empty string');
    }
    if (!Object.values(ToolType).includes(this.type)) {
      throw new Error('Invalid tool type');
    }
    if (!Object.values(ToolCategory).includes(this.category)) {
      throw new Error('Invalid tool category');
    }
    if (!Array.isArray(this.args)) {
      throw new Error('Tool arguments must be an array');
    }
    if (!this.functionName || typeof this.functionName !== 'string') {
      throw new Error('Tool function must be a non-empty string');
    }
    if (!this.metadata || typeof this.metadata !== 'object') {
      throw new Error('Tool metadata must be an object');
    }
    if (!this.metadata.version || typeof this.metadata.version !== 'string') {
      throw new Error('Tool metadata must include a version string');
    }
  }

  // Getters
  public getId(): string {
    return this.id;
  }

  public getName(): string {
    return this.name;
  }

  public getDescription(): string {
    return this.description;
  }

  public getType(): ToolType {
    return this.type;
  }

  public getCategory(): ToolCategory {
    return this.category;
  }

  public getArguments(): ToolArgument[] {
    return [...this.args];
  }

  public getFunctionName(): string {
    return this.functionName;
  }

  public getMetadata(): ToolMetadata {
    return { ...this.metadata };
  }

  public getCreatedAt(): Date {
    return this.createdAt;
  }

  public getUpdatedAt(): Date {
    return this.updatedAt;
  }

  // Business logic
  public validateArguments(args: Record<string, any>): boolean {
    for (const arg of this.args) {
      if (arg.required && !(arg.name in args)) {
        throw new Error(`Required argument '${arg.name}' is missing`);
      }

      if (arg.name in args) {
        const value = args[arg.name];
        if (typeof value !== arg.type) {
          throw new Error(
            `Argument '${arg.name}' must be of type '${arg.type}', got '${typeof value}'`,
          );
        }
      }
    }
    return true;
  }

  public hasRequiredArguments(): boolean {
    return this.args.some(arg => arg.required);
  }

  public getRequiredArguments(): ToolArgument[] {
    return this.args.filter(arg => arg.required);
  }

  public toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      type: this.type,
      category: this.category,
      arguments: this.args,
      functionName: this.functionName,
      metadata: this.metadata,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }

  // Factory method
  public static create(
    id: string,
    name: string,
    description: string,
    type: ToolType,
    category: ToolCategory,
    args: ToolArgument[],
    functionName: string,
    metadata: ToolMetadata,
  ): Tool {
    return new Tool(
      id,
      name,
      description,
      type,
      category,
      args,
      functionName,
      metadata,
    );
  }
}
