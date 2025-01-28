export class AgentRole {
  constructor(
    private readonly name: string,
    private readonly description: string,
    private readonly responsibilities: string[],
  ) {
    this.validateRole();
  }

  private validateRole(): void {
    if (!this.name || typeof this.name !== 'string' || this.name.trim().length === 0) {
      throw new Error('Role name must be a non-empty string');
    }
    if (!this.description || typeof this.description !== 'string') {
      throw new Error('Role description must be a non-empty string');
    }
    if (!Array.isArray(this.responsibilities) || this.responsibilities.length === 0) {
      throw new Error('Role must have at least one responsibility');
    }
    if (!this.responsibilities.every(r => typeof r === 'string' && r.trim().length > 0)) {
      throw new Error('All responsibilities must be non-empty strings');
    }
  }

  public getName(): string {
    return this.name;
  }

  public getDescription(): string {
    return this.description;
  }

  public getResponsibilities(): string[] {
    return [...this.responsibilities];
  }

  public equals(other: AgentRole): boolean {
    return (
      this.name === other.name &&
      this.description === other.description &&
      this.responsibilities.length === other.responsibilities.length &&
      this.responsibilities.every((r, i) => r === other.responsibilities[i])
    );
  }

  public toJSON() {
    return {
      name: this.name,
      description: this.description,
      responsibilities: this.responsibilities,
    };
  }

  // Predefined roles
  public static readonly COORDINATOR = new AgentRole(
    'Coordinator',
    'Manages and coordinates team activities and task distribution',
    [
      'Distribute tasks among team members',
      'Monitor task progress and completion',
      'Ensure effective communication between agents',
      'Optimize team performance and resource allocation',
    ]
  );

  public static readonly RESEARCHER = new AgentRole(
    'Researcher',
    'Gathers and analyzes information from various sources',
    [
      'Collect relevant data and information',
      'Analyze and synthesize findings',
      'Provide detailed research reports',
      'Identify patterns and insights',
    ]
  );

  public static readonly EXECUTOR = new AgentRole(
    'Executor',
    'Implements solutions and executes specific tasks',
    [
      'Execute assigned tasks efficiently',
      'Follow established procedures and guidelines',
      'Report task completion and results',
      'Handle task-specific tools and resources',
    ]
  );

  public static readonly VALIDATOR = new AgentRole(
    'Validator',
    'Verifies and validates work quality and results',
    [
      'Review and validate task outputs',
      'Ensure quality standards are met',
      'Provide feedback and suggestions',
      'Document validation results',
    ]
  );
}
