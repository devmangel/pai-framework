import { Exclude, Expose, Type } from 'class-transformer';

class RoleResponseDto {
  @Expose()
  name: string;

  @Expose()
  description: string;

  @Expose()
  responsibilities: string[];
}

class ParameterResponseDto {
  @Expose()
  name: string;

  @Expose()
  type: string;

  @Expose()
  description?: string;

  @Expose()
  required: boolean;

  @Expose()
  defaultValue?: any;
}

class CapabilityResponseDto {
  @Expose()
  name: string;

  @Expose()
  description: string;

  @Expose()
  type: string;

  @Expose()
  @Type(() => ParameterResponseDto)
  parameters: ParameterResponseDto[];
}

@Exclude()
export class AgentResponseDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  @Type(() => RoleResponseDto)
  role: RoleResponseDto;

  @Expose()
  @Type(() => CapabilityResponseDto)
  capabilities: CapabilityResponseDto[];

  @Expose()
  description: string;

  @Expose()
  goals: string[];

  @Expose()
  memory: Record<string, any>;

  @Expose()
  createdAt: string;

  @Expose()
  updatedAt: string;

  constructor(partial: Partial<AgentResponseDto>) {
    Object.assign(this, partial);
  }
}

export class AgentListResponseDto {
  @Expose()
  @Type(() => AgentResponseDto)
  items: AgentResponseDto[];

  @Expose()
  total: number;

  constructor(items: AgentResponseDto[], total: number) {
    this.items = items;
    this.total = total;
  }
}

export class DeleteAgentResponseDto {
  @Expose()
  message: string;

  constructor(message: string) {
    this.message = message;
  }
}
