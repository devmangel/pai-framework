import { TeamMember } from './team-member.vo';

export class TeamChannel {
  constructor(
    private readonly _id: string,
    private readonly _name: string,
    private _description: string,
    private readonly _createdBy: string,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
    private _members: TeamMember[] = [],
    private _messages: TeamChannelMessage[] = [],
  ) {}

  // Getters
  get id(): string {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  get description(): string {
    return this._description;
  }

  get createdBy(): string {
    return this._createdBy;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  get members(): TeamMember[] {
    return [...this._members];
  }

  get messages(): TeamChannelMessage[] {
    return [...this._messages];
  }

  // Methods
  updateDescription(description: string): void {
    this._description = description;
    this._updatedAt = new Date();
  }

  addMember(member: TeamMember): void {
    if (!this._members.some(m => m.agentId === member.agentId)) {
      this._members.push(member);
      this._updatedAt = new Date();
    }
  }

  removeMember(agentId: string): void {
    this._members = this._members.filter(m => m.agentId !== agentId);
    this._updatedAt = new Date();
  }

  addMessage(message: TeamChannelMessage): void {
    this._messages.push(message);
    this._updatedAt = new Date();
  }

  hasMember(agentId: string): boolean {
    return this._members.some(member => member.agentId === agentId);
  }

  // Factory method
  static create(
    id: string,
    name: string,
    description: string,
    createdBy: string,
    members: TeamMember[] = [],
  ): TeamChannel {
    const now = new Date();
    return new TeamChannel(
      id,
      name,
      description,
      createdBy,
      now,
      now,
      members,
      [],
    );
  }

  toJSON() {
    return {
      id: this._id,
      name: this._name,
      description: this._description,
      createdBy: this._createdBy,
      createdAt: this._createdAt.toISOString(),
      updatedAt: this._updatedAt.toISOString(),
      members: this._members.map(m => m.toJSON()),
      messages: this._messages.map(m => m.toJSON()),
    };
  }
}

export class TeamChannelMessage {
  constructor(
    private readonly _id: string,
    private readonly _content: string,
    private readonly _senderId: string,
    private readonly _createdAt: Date = new Date(),
    private _metadata: Record<string, any> = {},
  ) {}

  // Getters
  get id(): string {
    return this._id;
  }

  get content(): string {
    return this._content;
  }

  get senderId(): string {
    return this._senderId;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get metadata(): Record<string, any> {
    return { ...this._metadata };
  }

  // Methods
  updateMetadata(metadata: Record<string, any>): void {
    this._metadata = { ...this._metadata, ...metadata };
  }

  // Factory method
  static create(
    id: string,
    content: string,
    senderId: string,
    metadata: Record<string, any> = {},
  ): TeamChannelMessage {
    return new TeamChannelMessage(
      id,
      content,
      senderId,
      new Date(),
      metadata,
    );
  }

  toJSON() {
    return {
      id: this._id,
      content: this._content,
      senderId: this._senderId,
      createdAt: this._createdAt.toISOString(),
      metadata: this._metadata,
    };
  }
}
