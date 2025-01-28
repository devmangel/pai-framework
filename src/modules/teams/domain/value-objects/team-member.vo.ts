import { TeamRole } from '../enums/team-role.enum';

export class TeamMember {
  constructor(
    private readonly _agentId: string,
    private _role: TeamRole,
    private readonly _joinedAt: Date = new Date()
  ) {}

  // Getters
  get agentId(): string {
    return this._agentId;
  }

  get role(): TeamRole {
    return this._role;
  }

  get joinedAt(): Date {
    return this._joinedAt;
  }

  // Methods
  updateRole(role: TeamRole): void {
    this._role = role;
  }

  hasRole(role: TeamRole): boolean {
    return this._role === role;
  }

  // Role-based permission checks
  canManageTeam(): boolean {
    return [TeamRole.OWNER, TeamRole.ADMIN].includes(this._role);
  }

  canInviteMembers(): boolean {
    return [TeamRole.OWNER, TeamRole.ADMIN].includes(this._role);
  }

  canRemoveMembers(): boolean {
    return [TeamRole.OWNER, TeamRole.ADMIN].includes(this._role);
  }

  canUpdateTeamInfo(): boolean {
    return [TeamRole.OWNER, TeamRole.ADMIN].includes(this._role);
  }

  // Factory method
  static create(agentId: string, role: TeamRole = TeamRole.MEMBER): TeamMember {
    return new TeamMember(agentId, role);
  }

  toJSON() {
    return {
      agentId: this._agentId,
      role: this._role,
      joinedAt: this._joinedAt.toISOString(),
    };
  }
}
