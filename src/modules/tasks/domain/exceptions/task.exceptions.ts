export class TaskNotFoundError extends Error {
  constructor(taskId: string) {
    super(`Task with ID ${taskId} not found`);
    this.name = 'TaskNotFoundError';
  }
}

export class TaskValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TaskValidationError';
  }
}

export class TaskStateError extends Error {
  constructor(taskId: string, currentState: string, requiredState: string) {
    super(
      `Task ${taskId} is in state ${currentState} but must be in state ${requiredState}`,
    );
    this.name = 'TaskStateError';
  }
}

export class TaskDependencyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TaskDependencyError';
  }
}

export class TaskAssignmentError extends Error {
  constructor(taskId: string, message: string) {
    super(`Cannot assign task ${taskId}: ${message}`);
    this.name = 'TaskAssignmentError';
  }
}

export class TaskOperationError extends Error {
  constructor(taskId: string, operation: string, reason: string) {
    super(`Cannot ${operation} task ${taskId}: ${reason}`);
    this.name = 'TaskOperationError';
  }
}

export class CircularDependencyError extends TaskDependencyError {
  constructor(taskId: string, dependencyId: string) {
    super(
      `Adding dependency ${dependencyId} to task ${taskId} would create a circular dependency`,
    );
    this.name = 'CircularDependencyError';
  }
}

export class DependencyNotMetError extends TaskStateError {
  constructor(taskId: string, dependencyId: string) {
    super(
      taskId,
      'PENDING',
      'READY',
    );
    this.message = `Cannot start task ${taskId}: dependency ${dependencyId} is not completed`;
    this.name = 'DependencyNotMetError';
  }
}

export class TaskAlreadyExistsError extends Error {
  constructor(taskId: string) {
    super(`Task with ID ${taskId} already exists`);
    this.name = 'TaskAlreadyExistsError';
  }
}

export class InvalidTaskPriorityError extends TaskValidationError {
  constructor(priority: string) {
    super(`Invalid task priority: ${priority}`);
    this.name = 'InvalidTaskPriorityError';
  }
}

export class InvalidTaskStatusError extends TaskValidationError {
  constructor(status: string) {
    super(`Invalid task status: ${status}`);
    this.name = 'InvalidTaskStatusError';
  }
}

export class TaskUpdateError extends Error {
  constructor(taskId: string, reason: string) {
    super(`Cannot update task ${taskId}: ${reason}`);
    this.name = 'TaskUpdateError';
  }
}

export class TaskDeleteError extends Error {
  constructor(taskId: string, reason: string) {
    super(`Cannot delete task ${taskId}: ${reason}`);
    this.name = 'TaskDeleteError';
  }
}
