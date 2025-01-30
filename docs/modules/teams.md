# Teams Module

## Overview

The Teams module is responsible for managing teams within the system. It includes functionalities for creating, updating, deleting, and querying teams, as well as handling team members and channels.

## Structure

The module is structured as follows:

- `teams.module.ts`: Defines the Teams module and its dependencies.
- `domain/`: Contains the domain layer, including entities and repository interfaces.
  - `entities/team.entity.ts`: Defines the `Team` entity.
  - `ports/team.repository.ts`: Defines the `TeamRepository` interface and related exceptions.
- `infrastructure/`: Contains the infrastructure layer, including repository implementations.
  - `repositories/dynamodb-team.repository.ts`: Implements the `TeamRepository` interface using DynamoDB.
- `interface/`: Contains the interface layer, including HTTP controllers and DTOs.
  - `http/teams.controller.ts`: Defines the `TeamsController` for handling HTTP requests.
  - `application/dtos/create-team.dto.ts`: Defines the DTO for creating a team.
  - `application/dtos/channel.dto.ts`: Defines DTOs for managing team channels.

## Components

### Teams Module

The `TeamsModule` is defined in `teams.module.ts` and includes the following components:

- `TeamsController`: Handles HTTP requests related to teams.
- `DynamoDBTeamRepository`: Implements the `TeamRepository` interface using DynamoDB.
- `TeamService`: Provides the service implementation for managing teams.
- `TEAM_REPOSITORY`: Token for the team repository.

### Entities

#### Team

The `Team` entity represents a team in the system. It includes properties such as `id`, `name`, `description`, `members`, `channels`, `createdAt`, and `updatedAt`.

### Repositories

#### TeamRepository

The `TeamRepository` interface defines the methods for interacting with the team repository. These methods include:

- `findById(id: string): Promise<Team | null>`
- `findAll(): Promise<Team[]>`
- `findByMemberId(agentId: string): Promise<Team[]>`
- `save(team: Team): Promise<void>`
- `delete(id: string): Promise<void>`
- `exists(id: string): Promise<boolean>`
- `findByName(name: string): Promise<Team | null>`

### Implementations

#### DynamoDBTeamRepository

The `DynamoDBTeamRepository` class implements the `TeamRepository` interface using DynamoDB. It provides methods to interact with DynamoDB for storing, retrieving, updating, and deleting teams.

### Controllers

#### TeamsController

The `TeamsController` class handles HTTP requests related to teams. It includes methods for creating, finding, updating, and deleting teams, as well as managing team members and channels.

### DTOs

#### CreateTeamDto

The `CreateTeamDto` class is used to validate and transfer the data needed to create a team. It includes properties such as `name`, `description`, and `members`.

#### Channel DTOs

The `Channel DTOs` are used to validate and transfer the data needed to manage team channels. These include:

- `CreateChannelDto`: Defines the DTO for creating a channel.
- `UpdateChannelDescriptionDto`: Defines the DTO for updating a channel's description.
- `AddChannelMemberDto`: Defines the DTO for adding a member to a channel.
- `RemoveChannelMemberDto`: Defines the DTO for removing a member from a channel.
- `AddChannelMessageDto`: Defines the DTO for adding a message to a channel.
