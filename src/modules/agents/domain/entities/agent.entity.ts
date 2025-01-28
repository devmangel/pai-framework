import { AgentRole } from '../value-objects/agent-role.vo';
import { AgentCapability } from '../value-objects/agent-capability.vo';
import { AgentId } from '../value-objects/agent-id.vo';

export class Agent {
  constructor(
    private readonly id: AgentId,
    private name: string,
    private role: AgentRole,
    private capabilities: AgentCapability[],
    private description: string,
    private goals: string[],
    private memory: Record<string, any>,
    private createdAt: Date,
    private updatedAt: Date,
  ) {}

  public static create(
    name: string,
    role: AgentRole,
    capabilities: AgentCapability[],
    description: string,
    goals: string[],
  ): Agent {
    const now = new Date();
    return new Agent(
      AgentId.generate(),
      name,
      role,
      capabilities,
      description,
      goals,
      {},
      now,
      now,
    );
  }

  // Getters
  public getId(): AgentId {
    return this.id;
  }

  public getName(): string {
    return this.name;
  }

  public getRole(): AgentRole {
    return this.role;
  }

  public getCapabilities(): AgentCapability[] {
    return [...this.capabilities];
  }

  public getDescription(): string {
    return this.description;
  }

  public getGoals(): string[] {
    return [...this.goals];
  }

  public getMemory(): Record<string, any> {
    return { ...this.memory };
  }

  public getCreatedAt(): Date {
    return this.createdAt;
  }

  public getUpdatedAt(): Date {
    return this.updatedAt;
  }

  // Setters and modifiers
  public updateName(name: string): void {
    this.name = name;
    this.updateTimestamp();
  }

  public updateRole(role: AgentRole): void {
    this.role = role;
    this.updateTimestamp();
  }

  public addCapability(capability: AgentCapability): void {
    if (!this.capabilities.some(cap => cap.equals(capability))) {
      this.capabilities.push(capability);
      this.updateTimestamp();
    }
  }

  public removeCapability(capability: AgentCapability): void {
    this.capabilities = this.capabilities.filter(cap => !cap.equals(capability));
    this.updateTimestamp();
  }

  public updateDescription(description: string): void {
    this.description = description;
    this.updateTimestamp();
  }

  public updateGoals(goals: string[]): void {
    this.goals = [...goals];
    this.updateTimestamp();
  }

  public updateMemory(key: string, value: any): void {
    this.memory[key] = value;
    this.updateTimestamp();
  }

  private updateTimestamp(): void {
    this.updatedAt = new Date();
  }

  public toJSON() {
    return {
      id: this.id.toString(),
      name: this.name,
      role: this.role.toJSON(),
      capabilities: this.capabilities.map(cap => cap.toJSON()),
      description: this.description,
      goals: this.goals,
      memory: this.memory,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }
}
