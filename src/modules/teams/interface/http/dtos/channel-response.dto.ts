export interface TeamChannelMessageResponseDto {
  id: string;
  content: string;
  senderId: string;
  createdAt: string;
  metadata: Record<string, any>;
}

export interface TeamChannelMemberResponseDto {
  agentId: string;
  role: string;
  joinedAt: string;
}

export interface TeamChannelResponseDto {
  id: string;
  name: string;
  description: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  members: TeamChannelMemberResponseDto[];
  messages: TeamChannelMessageResponseDto[];
}
