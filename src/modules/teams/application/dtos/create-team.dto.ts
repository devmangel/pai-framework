import { IsString, IsNotEmpty, IsArray, ValidateNested, IsEnum, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { TeamRole } from '../../domain/enums/team-role.enum';

export class CreateTeamMemberDto {
  @IsString()
  @IsNotEmpty()
  agentId: string;

  @IsEnum(TeamRole)
  @IsOptional()
  role: TeamRole = TeamRole.MEMBER;
}

export class CreateTeamDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTeamMemberDto)
  @IsOptional()
  members: CreateTeamMemberDto[] = [];
}
