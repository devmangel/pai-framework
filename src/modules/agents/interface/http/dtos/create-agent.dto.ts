import { IsString, IsArray, IsNotEmpty, ValidateNested, IsOptional, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { CapabilityType, ParameterType } from '../../../domain/value-objects/agent-capability.vo';

class RoleDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  responsibilities: string[];
}

class ParameterDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(ParameterType)
  @IsNotEmpty()
  type: ParameterType;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNotEmpty()
  required: boolean;

  @IsOptional()
  defaultValue?: any;
}

class CapabilityDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsEnum(CapabilityType)
  @IsNotEmpty()
  type: CapabilityType;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ParameterDto)
  parameters: ParameterDto[];
}

export class CreateAgentDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @ValidateNested()
  @Type(() => RoleDto)
  role: RoleDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CapabilityDto)
  capabilities: CapabilityDto[];

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  goals: string[];
}
