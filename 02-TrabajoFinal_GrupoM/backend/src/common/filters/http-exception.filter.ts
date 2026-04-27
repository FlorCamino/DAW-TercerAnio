import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<Request>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();

      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null &&
        'message' in exceptionResponse
      ) {
        const errorMessage = (
          exceptionResponse as { message: string | string[] }
        ).message;

        message = Array.isArray(errorMessage)
          ? errorMessage.join(', ')
          : errorMessage;
      }
    }

    if (
      typeof exception === 'object' &&
      exception !== null &&
      'code' in exception
    ) {
      const dbError = exception as { code: string };

      switch (dbError.code) {
        case '23505': 
          statusCode = HttpStatus.CONFLICT;
          message = 'The record already exists';
          break;

        case '23503': 
          statusCode = HttpStatus.BAD_REQUEST;
          message = 'The record is related to another entity';
          break;

        case '23502':
          statusCode = HttpStatus.BAD_REQUEST;
          message = 'Required field is missing';
          break;
      }
    }

    response.status(statusCode).json({
      success: false,
      statusCode,
      message,
      path: request.url,
      method: request.method,
      timestamp: new Date().toISOString(),
    });
  }
}