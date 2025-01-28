import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class TaskExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let code = 'INTERNAL_ERROR';
    let details = {};

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const response = exception.getResponse() as any;
      message = response.message || exception.message;
      code = response.code || this.getErrorCode(status);
      details = response.details || {};
    } else if (exception instanceof Error) {
      // Handle domain-specific errors
      switch (exception.constructor.name) {
        case 'TaskNotFoundError':
          status = HttpStatus.NOT_FOUND;
          code = 'TASK_NOT_FOUND';
          message = exception.message;
          break;

        case 'TaskValidationError':
          status = HttpStatus.BAD_REQUEST;
          code = 'TASK_VALIDATION_ERROR';
          message = exception.message;
          break;

        case 'TaskStateError':
          status = HttpStatus.CONFLICT;
          code = 'TASK_STATE_ERROR';
          message = exception.message;
          break;

        case 'TaskDependencyError':
          status = HttpStatus.BAD_REQUEST;
          code = 'TASK_DEPENDENCY_ERROR';
          message = exception.message;
          break;

        case 'TaskAssignmentError':
          status = HttpStatus.BAD_REQUEST;
          code = 'TASK_ASSIGNMENT_ERROR';
          message = exception.message;
          break;

        default:
          // Log unexpected errors
          console.error('Unhandled error:', exception);
          message = 'An unexpected error occurred';
          code = 'INTERNAL_ERROR';
      }
    }

    response.status(status).json({
      statusCode: status,
      code,
      message,
      details,
      timestamp: new Date().toISOString(),
      path: ctx.getRequest().url,
    });
  }

  private getErrorCode(status: number): string {
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return 'BAD_REQUEST';
      case HttpStatus.UNAUTHORIZED:
        return 'UNAUTHORIZED';
      case HttpStatus.FORBIDDEN:
        return 'FORBIDDEN';
      case HttpStatus.NOT_FOUND:
        return 'NOT_FOUND';
      case HttpStatus.CONFLICT:
        return 'CONFLICT';
      case HttpStatus.UNPROCESSABLE_ENTITY:
        return 'UNPROCESSABLE_ENTITY';
      case HttpStatus.TOO_MANY_REQUESTS:
        return 'TOO_MANY_REQUESTS';
      default:
        return 'INTERNAL_ERROR';
    }
  }
}
