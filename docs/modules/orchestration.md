# Orchestration Module

## Overview

The Orchestration module is responsible for managing the orchestration of agents and teams within the system. It includes functionalities for handling events, orchestrating tasks, and integrating with RabbitMQ for message consumption.

## Structure

The module is structured as follows:

- `orchestration.module.ts`: Defines the Orchestration module and its dependencies.
- `application/`: Contains the application layer, including services and event handlers.
  - `services/orchestrator-agents.service.ts`: Defines the `OrchestratorAgentsService` for orchestrating agent tasks.
  - `services/orchestrator-teams.service.ts`: Defines the `OrchestratorTeamsService` for orchestrating team creation.
  - `event-handlers/agent-assigned-to-task.handler.ts`: Defines the `AgentAssignedToTaskHandler` for handling agent task assignment events.
  - `event-handlers/team-created.handler.ts`: Defines the `TeamCreatedHandler` for handling team creation events.
- `infrastructure/`: Contains the infrastructure layer, including RabbitMQ consumers.
  - `rabbitmq/rabbitmq.consumer.ts`: Defines the `RabbitMQConsumer` for consuming RabbitMQ messages.

## Components

### Orchestration Module

The `OrchestrationModule` is defined in `orchestration.module.ts` and includes the following components:

- `OrchestratorAgentsService`: Provides the service implementation for orchestrating agent tasks.
- `OrchestratorTeamsService`: Provides the service implementation for orchestrating team creation.
- `AgentAssignedToTaskHandler`: Handles the `AgentAssignedToTaskEvent` for agent task assignments.
- `TeamCreatedHandler`: Handles the `TeamCreatedEvent` for team creation.
- `RabbitMQConsumer`: Consumes RabbitMQ messages for task assignments.

### Services

#### OrchestratorAgentsService

The `OrchestratorAgentsService` class orchestrates the flow when an agent receives a task. It interacts with various other services, including `AgentsService`, `TaskServiceImpl`, `LLMService`, `ToolService`, and `MemoryRepository`.

#### OrchestratorTeamsService

The `OrchestratorTeamsService` class orchestrates actions when a new team is created. It interacts with `TeamService` and provides methods for handling team creation, including creating default channels and notifying the team creator.

### Event Handlers

#### AgentAssignedToTaskHandler

The `AgentAssignedToTaskHandler` class handles the `AgentAssignedToTaskEvent` and interacts with `OrchestratorAgentsService` to initiate the orchestration flow when an agent is assigned to a task.

#### TeamCreatedHandler

The `TeamCreatedHandler` class handles the `TeamCreatedEvent` and interacts with `OrchestratorTeamsService` to initiate the orchestration flow when a new team is created.

### Consumers

#### RabbitMQConsumer

The `RabbitMQConsumer` class listens to the `tasks` exchange with the `task.assigned` routing key and interacts with `OrchestratorAgentsService` to initiate the orchestration flow when a task is assigned to an agent.
