export class AgentAssignedToTaskEvent {
    constructor(
      public readonly agentId: string,
      public readonly taskId: string,
    ) {}
  }