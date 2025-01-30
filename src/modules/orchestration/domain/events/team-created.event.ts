export class TeamCreatedEvent {
    constructor(
        public readonly teamId: string,
        public readonly creatorAgentId?: string,
    ) { }
}