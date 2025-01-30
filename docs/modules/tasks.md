# Tasks Module

## Overview

The Tasks module is responsible for managing tasks within the system. It includes functionalities for creating, updating, deleting, and querying tasks, as well as handling task dependencies, assignments, and lifecycle management.

## Structure

The module is structured as follows:

- `tasks.module.ts`: Defines the Tasks module and its dependencies.
- `domain/`: Contains the domain layer, including entities and repository interfaces.
  - `entities/task.entity.ts`: Defines the `Task` entity.
  - `ports/task.repository.ts`: Defines the `TaskRepository` interface and related exceptions.
- `infrastructure/`: Contains the infrastructure layer, including repository implementations.
  - `persistence/dynamodb/task.repository.ts`: Implements the `TaskRepository` interface using DynamoDB.
- `interface/`: Contains the interface layer, including HTTP controllers and DTOs.
  - `http/tasks.controller.ts`: Defines the `TasksController` for handling HTTP requests.
  - `http/dtos/create-task.dto.ts`: Defines the DTO for creating a task.
  - `http/dtos/update-task.dto.ts`: Defines the DTO for updating a task.

## Components

### Tasks Module

The `TasksModule` is defined in `tasks.module.ts` and includes the following components:

- `TasksController`: Handles HTTP requests related to tasks.
- `DynamoDBTaskRepository`: Implements the `TaskRepository` interface using DynamoDB.
- `TaskServiceImpl`: Provides the service implementation for managing tasks.
- `TASK_REPOSITORY`: Token for the task repository.

### Entities

#### Task

The `Task` entity represents a task in the system. It includes properties such as `id`, `title`, `description`, `status`, `priority`, `assignedAgent`, `parentId`, `dependencies`, `metadata`, `result`, `createdAt`, `updatedAt`, `startedAt`, `completedAt`, and `dueDate`.

### Repositories

#### TaskRepository

The `TaskRepository` interface defines the methods for interacting with the task repository. These methods include:

- `create(task: Task): Promise<Task>`
- `update(task: Task): Promise<Task>`
- `save(task: Task): Promise<void>`
- `findById(id: string): Promise<Task | null>`
- `findAll(filters?: { status?: TaskStatus; priority?: TaskPriority; agentId?: string; parentId?: string }): Promise<Task[]>`
- `delete(id: string): Promise<void>`
- `findByStatus(status: TaskStatus): Promise<Task[]>`
- `findByPriority(priority: TaskPriority): Promise<Task[]>`
- `findByAgent(agentId: string): Promise<Task[]>`
- `findByParent(parentId: string): Promise<Task[]>`
- `findDependencies(taskId: string): Promise<Task[]>`
- `findDependents(taskId: string): Promise<Task[]>`
- `findBlocked(): Promise<Task[]>`
- `findOverdue(): Promise<Task[]>`
- `exists(id: string): Promise<boolean>`
- `createMany(tasks: Task[]): Promise<Task[]>`
- `updateMany(tasks: Task[]): Promise<Task[]>`
- `saveMany(tasks: Task[]): Promise<void>`
- `deleteMany(ids: string[]): Promise<void>`
- `addDependency(taskId: string, dependencyId: string): Promise<void>`
- `removeDependency(taskId: string, dependencyId: string): Promise<void>`
- `getDependencies(taskId: string): Promise<Task[]>`
- `getDependents(taskId: string): Promise<Task[]>`
- `countByStatus(): Promise<Record<TaskStatus, number>>`
- `countByPriority(): Promise<Record<TaskPriority, number>>`
- `countByAgent(): Promise<Record<string, number>>`

### Implementations

#### DynamoDBTaskRepository

The `DynamoDBTaskRepository` class implements the `TaskRepository` interface using DynamoDB. It provides methods to interact with DynamoDB for storing, retrieving, updating, and deleting tasks.

### Controllers

#### TasksController

The `TasksController` class handles HTTP requests related to tasks. It includes methods for creating, finding, updating, and deleting tasks, as well as managing task lifecycle, assignments, dependencies, batch operations, and statistics.

### DTOs

#### CreateTaskDto

The `CreateTaskDto` class is used to validate and transfer the data needed to create a task. It includes properties such as `title`, `description`, `priority`, `parentId`, `dependencies`, and `metadata`.

#### UpdateTaskDto

The `UpdateTaskDto` class is used to validate and transfer the data needed to update a task. It includes properties such as `title`, `description`, `priority`, and `metadata`.
