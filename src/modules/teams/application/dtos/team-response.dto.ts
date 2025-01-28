import { TeamChannelResponseDto } from './channel-response.dto';

export interface TeamMemberResponseDto {
  agentId: string;
  role: string;
  joinedAt: Date;
}

export interface TeamResponseDto {
  id: string;
  name: string;
  description: string;
  members: TeamMemberResponseDto[];
  channels: TeamChannelResponseDto[];
  createdAt: Date;
  updatedAt: Date;
}
