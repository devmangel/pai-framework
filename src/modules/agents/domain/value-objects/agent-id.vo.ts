import { randomUUID } from 'crypto';

export class AgentId {
  constructor(private readonly value: string) {
    this.validateId(value);
  }

  private validateId(id: string): void {
    if (!id || typeof id !== 'string') {
      throw new Error('Agent ID must be a non-empty string');
    }
    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      throw new Error('Agent ID must be a valid UUID v4');
    }
  }

  public static generate(): AgentId {
    return new AgentId(randomUUID());
  }

  public getValue(): string {
    return this.value;
  }

  public equals(other: AgentId): boolean {
    return this.value === other.value;
  }

  public toString(): string {
    return this.value;
  }

  public toJSON(): string {
    return this.value;
  }
}
