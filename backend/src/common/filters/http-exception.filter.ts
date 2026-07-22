import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

interface ExceptionResponseObject {
  message?: string | string[];
  error?: string;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorMessage = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        errorMessage = exceptionResponse;
      } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const responseObj = exceptionResponse as ExceptionResponseObject;
        if (Array.isArray(responseObj.message)) {
          errorMessage = responseObj.message.join(', ');
        } else if (typeof responseObj.message === 'string') {
          errorMessage = responseObj.message;
        } else if (typeof responseObj.error === 'string') {
          errorMessage = responseObj.error;
        }
      }
    }

    response.status(status).json({
      success: false,
      error: errorMessage,
      statusCode: status,
    });
  }
}
