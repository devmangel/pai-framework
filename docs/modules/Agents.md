# Agents Module

## Overview

The Agents module is responsible for managing agents within the system. It includes functionalities for creating, updating, deleting, and querying agents, as well as assigning tasks to them.

## Structure

The module is structured as follows:

- `agents.module.ts`: Defines the Agents module and its dependencies.
- `application/`: Contains the application layer, including services and use cases.
  - `services/agent-application.service.ts`: Implements the `AgentsService` interface, providing methods to manage agents.
  - `use-cases/create-agent.use-case.ts`: Defines the use case for creating an agent.
- `domain/`: Contains the domain layer, including entities, value objects, and repository interfaces.
  - `entities/agent.entity.ts`: Defines the `Agent` entity.
  - `ports/agent.repository.ts`: Defines the `AgentRepository` interface and related errors.
- `infrastructure/`: Contains the infrastructure layer, including persistence implementations.
  - `persistence/dynamodb/agent.repository.ts`: Implements the `AgentRepository` interface using DynamoDB.
- `interface/`: Contains the interface layer, including HTTP controllers and DTOs.
  - `http/agents.controller.ts`: Defines the `AgentsController` for handling HTTP requests.
  - `http/dtos/agent-response.dto.ts`: Defines DTOs for agent responses.
  - `http/dtos/create-agent.dto.ts`: Defines the DTO for creating an agent.

## Components

### Agents Module

The `AgentsModule` is defined in `agents.module.ts` and includes the following components:

- `AgentsController`: Handles HTTP requests related to agents.
- `DynamoDBAgentRepository`: Implements the `AgentRepository` interface using DynamoDB.
- `CreateAgentUseCase`: Provides the use case for creating an agent.
- `AgentRepository`: Interface for the agent repository.
- `ConfigService`: Provides configuration settings for AWS and DynamoDB.

### Services

#### AgentsService

The `AgentsService` interface defines the following methods:

- `createAgent(dto: CreateAgentDto): Promise<Agent>`
- `updateAgent(id: string, dto: UpdateAgentDto): Promise<Agent>`
- `deleteAgent(id: string): Promise<void>`
- `assignTask(agentId: string, taskId: string): Promise<void>`
- `startTask(agentId: string, taskId: string): Promise<void>`
- `completeTask(agentId: string, taskId: string, result: TaskResult): Promise<void>`
- `failTask(agentId: string, taskId: string, error: string): Promise<void>`

#### AgentsServiceImpl

The `AgentsServiceImpl` class implements the `AgentsService` interface and provides the methods to manage agents.

### Use Cases

#### CreateAgentUseCase

The `CreateAgentUseCase` class provides the use case for creating an agent. It includes the following method:

- `execute(dto: CreateAgentDto): Promise<Agent>`

### Entities

#### Agent

The `Agent` entity represents an agent in the system. It includes properties such as `id`, `name`, `role`, `capabilities`, `description`, `goals`, `memory`, `createdAt`, and `updatedAt`.

### Repositories

#### AgentRepository

The `AgentRepository` interface defines the methods for interacting with the agent repository. These methods include:

- `save(agent: Agent): Promise<void>`
- `findById(id: AgentId): Promise<Agent | null>`
- `findAll(): Promise<Agent[]>`
- `findByName(name: string): Promise<Agent[]>`
- `update(agent: Agent): Promise<void>`
- `delete(id: AgentId): Promise<void>`
- `findByTeamId(teamId: string): Promise<Agent[]>`
- `findByCapability(capabilityName: string): Promise<Agent[]>`
- `findByRole(roleName: string): Promise<Agent[]>`
- `findAvailableAgents(): Promise<Agent[]>`
- `findBusyAgents(): Promise<Agent[]>`
- `findByExpertise(expertise: string[]): Promise<Agent[]>`
- `findByGoals(goals: string[]): Promise<Agent[]>`
- `saveMany(agents: Agent[]): Promise<void>`
- `deleteMany(ids: AgentId[]): Promise<void>`

### Controllers

#### AgentsController

The `AgentsController` class handles HTTP requests related to agents. It includes methods for creating, finding, updating, and deleting agents, as well as querying agents based on teams, capabilities, roles, and status.

### DTOs

#### CreateAgentDto

The `CreateAgentDto` class is used to validate and transfer the data needed to create an agent. It includes properties such as `name`, `role`, `capabilities`, `description`, and `goals`.

#### AgentResponseDto

The `AgentResponseDto` class is used to structure the response for agent-related requests. It includes properties such as `id`, `name`, `role`, `capabilities`, `description`, `goals`, `memory`, `createdAt`, and `updatedAt`.

#### AgentListResponseDto

The `AgentListResponseDto` class is used to structure the response for a list of agents. It includes properties such as `items` and `total`.

#### DeleteAgentResponseDto

The `DeleteAgentResponseDto` class is used to structure the response for deleting an agent. It includes a `message` property.
