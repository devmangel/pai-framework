import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import {
  LLMServiceError,
  RateLimitError,
  TokenLimitError,
  InvalidRequestError,
  ProviderError,
  TimeoutError,
} from '../../../domain/ports/llm.service';

@Catch(LLMServiceError)
export class LLMExceptionFilter implements ExceptionFilter {
  catch(exception: LLMServiceError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status: HttpStatus;
    let message: string;
    let code: string;
    let details: Record<string, any> = {};

    if (exception instanceof RateLimitError) {
      status = HttpStatus.TOO_MANY_REQUESTS;
      message = exception.message;
      code = 'RATE_LIMIT_EXCEEDED';
      details = {
        resetDate: exception.resetDate,
        provider: exception.provider,
      };
    } else if (exception instanceof TokenLimitError) {
      status = HttpStatus.BAD_REQUEST;
      message = exception.message;
      code = 'TOKEN_LIMIT_EXCEEDED';
      details = {
        tokenCount: exception.tokenCount,
        maxTokens: exception.maxTokens,
        provider: exception.provider,
      };
    } else if (exception instanceof InvalidRequestError) {
      status = HttpStatus.BAD_REQUEST;
      message = exception.message;
      code = 'INVALID_REQUEST';
      details = {
        provider: exception.provider,
      };
    } else if (exception instanceof TimeoutError) {
      status = HttpStatus.GATEWAY_TIMEOUT;
      message = exception.message;
      code = 'TIMEOUT';
      details = {
        timeout: exception.timeout,
        provider: exception.provider,
      };
    } else if (exception instanceof ProviderError) {
      status = HttpStatus.BAD_GATEWAY;
      message = exception.message;
      code = 'PROVIDER_ERROR';
      details = {
        provider: exception.provider,
      };
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'An unexpected error occurred while processing the LLM request';
      code = 'INTERNAL_ERROR';
      details = {
        provider: exception.provider,
      };
    }

    if (exception.model) {
      details.model = exception.model;
    }

    response.status(status).json({
      statusCode: status,
      message,
      code,
      timestamp: new Date().toISOString(),
      details,
    });
  }
}
