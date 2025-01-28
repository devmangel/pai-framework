import { IsString, IsArray, IsOptional, IsUUID, ValidateNested, IsObject } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateChannelDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsString()
  createdBy: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  initialMembers?: string[];
}

export class UpdateChannelDescriptionDto {
  @IsUUID()
  channelId: string;

  @IsString()
  description: string;

  @IsString()
  updatedBy: string;
}

export class AddChannelMemberDto {
  @IsUUID()
  channelId: string;

  @IsString()
  memberId: string;

  @IsString()
  addedBy: string;
}

export class RemoveChannelMemberDto {
  @IsUUID()
  channelId: string;

  @IsString()
  memberId: string;

  @IsString()
  removedBy: string;
}

export class AddChannelMessageDto {
  @IsUUID()
  channelId: string;

  @IsString()
  content: string;

  @IsString()
  senderId: string;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}
