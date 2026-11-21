import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const exceptionResponse = exception.response;
    console.error(exception.stack);

    if (!exceptionResponse) {
      response
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          timestamp: new Date().toISOString(),
          path: exceptionResponse?.config?.url,
          message: exception.message
        });
    }

    const status = exceptionResponse?.status || exceptionResponse?.statusCode;
    const message = exceptionResponse?.data?.message || exceptionResponse?.message;

    response
      .status(status)
      .json({
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: exceptionResponse?.config?.url,
        message: message
      });
  }
}