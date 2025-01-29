import { IsString, IsOptional, IsArray, IsObject } from 'class-validator';

export class CreateTeamDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsArray()
  @IsOptional()
  agentIds?: string[];

  @IsObject()
  @IsOptional()
  config?: Record<string, any>;

  @IsString()
  @IsOptional()
  leadAgentId?: string;
}
