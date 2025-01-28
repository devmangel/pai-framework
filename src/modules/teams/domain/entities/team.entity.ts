import { AggregateRoot } from '@nestjs/cqrs';
import { TeamMember } from '../value-objects/team-member.vo';
import { TeamRole } from '../enums/team-role.enum';
import { TeamChannel } from '../value-objects/team-channel.vo';

export class Team extends AggregateRoot {
  private readonly _id: string;
  private _name: string;
  private _description: string;
  private _members: TeamMember[];
  private _channels: TeamChannel[];
  private _createdAt: Date;
  private _updatedAt: Date;

  constructor(
    id: string,
    name: string,
    description: string,
    members: TeamMember[] = [],
    channels: TeamChannel[] = [],
  ) {
    super();
    this._id = id;
    this._name = name;
    this._description = description;
    this._members = members;
    this._channels = channels;
    this._createdAt = new Date();
    this._updatedAt = new Date();
  }

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

  get members(): TeamMember[] {
    return [...this._members];
  }

  get channels(): TeamChannel[] {
    return [...this._channels];
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  // Methods
  updateName(name: string): void {
    this._name = name;
    this._updatedAt = new Date();
  }

  updateDescription(description: string): void {
    this._description = description;
    this._updatedAt = new Date();
  }

  addMember(member: TeamMember): void {
    if (this.hasMember(member.agentId)) {
      throw new Error('Member already exists in team');
    }
    this._members.push(member);
    this._updatedAt = new Date();
  }

  removeMember(agentId: string): void {
    const index = this._members.findIndex(member => member.agentId === agentId);
    if (index === -1) {
      throw new Error('Member not found in team');
    }
    this._members.splice(index, 1);
    this._updatedAt = new Date();
  }

  updateMemberRole(agentId: string, role: TeamRole): void {
    const member = this._members.find(m => m.agentId === agentId);
    if (!member) {
      throw new Error('Member not found in team');
    }
    member.updateRole(role);
    this._updatedAt = new Date();
  }

  hasMember(agentId: string): boolean {
    return this._members.some(member => member.agentId === agentId);
  }

  // Channel management methods
  createChannel(
    id: string,
    name: string,
    description: string,
    createdBy: string,
    members: TeamMember[] = [],
  ): void {
    if (this._channels.some(channel => channel.name === name)) {
      throw new Error('Channel with this name already exists');
    }
    const channel = TeamChannel.create(id, name, description, createdBy, members);
    this._channels.push(channel);
    this._updatedAt = new Date();
  }

  getChannel(channelId: string): TeamChannel | undefined {
    return this._channels.find(channel => channel.id === channelId);
  }

  removeChannel(channelId: string): void {
    const index = this._channels.findIndex(channel => channel.id === channelId);
    if (index === -1) {
      throw new Error('Channel not found');
    }
    this._channels.splice(index, 1);
    this._updatedAt = new Date();
  }

  updateChannelDescription(channelId: string, description: string): void {
    const channel = this.getChannel(channelId);
    if (!channel) {
      throw new Error('Channel not found');
    }
    channel.updateDescription(description);
    this._updatedAt = new Date();
  }

  addMemberToChannel(channelId: string, member: TeamMember): void {
    const channel = this.getChannel(channelId);
    if (!channel) {
      throw new Error('Channel not found');
    }
    if (!this.hasMember(member.agentId)) {
      throw new Error('Agent is not a member of the team');
    }
    channel.addMember(member);
    this._updatedAt = new Date();
  }

  removeMemberFromChannel(channelId: string, agentId: string): void {
    const channel = this.getChannel(channelId);
    if (!channel) {
      throw new Error('Channel not found');
    }
    channel.removeMember(agentId);
    this._updatedAt = new Date();
  }

  // Factory method
  static create(
    id: string,
    name: string,
    description: string,
    members: TeamMember[] = [],
    channels: TeamChannel[] = [],
  ): Team {
    return new Team(id, name, description, members, channels);
  }

  toJSON() {
    return {
      id: this._id,
      name: this._name,
      description: this._description,
      members: this._members.map(m => m.toJSON()),
      channels: this._channels.map(c => c.toJSON()),
      createdAt: this._createdAt.toISOString(),
      updatedAt: this._updatedAt.toISOString(),
    };
  }
}
