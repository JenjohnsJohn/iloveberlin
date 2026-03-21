import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class GlobalHttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalHttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const isProduction = process.env.NODE_ENV === 'production';

    let status: number;
    let message: string | object;
    let errorName: string;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      errorName = exception.constructor.name;
      const exceptionResponse = exception.getResponse();
      message =
        typeof exceptionResponse === 'string'
          ? { message: exceptionResponse }
          : (exceptionResponse as object);
    } else if (exception instanceof Error) {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      errorName = exception.constructor.name;
      message = {
        message: isProduction
          ? 'Internal server error'
          : exception.message || 'Internal server error',
      };
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      errorName = 'UnknownError';
      message = { message: 'Internal server error' };
    }

    // Log at appropriate severity: warn for client errors, error for server errors
    const logMessage = `${request.method} ${request.url} -> ${status} ${errorName}`;
    const logTrace = exception instanceof Error ? exception.stack : String(exception);

    if (status >= 500) {
      this.logger.error(logMessage, logTrace);
    } else if (status >= 400) {
      this.logger.warn(logMessage);
    }

    const errorResponse: Record<string, unknown> = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      ...(typeof message === 'object' ? message : { message }),
    };

    // Only include debug details in non-production
    if (!isProduction) {
      errorResponse.error = errorName;
      if (exception instanceof Error) {
        errorResponse.stack = exception.stack;
      }
    }

    response.status(status).json(errorResponse);
  }
}
