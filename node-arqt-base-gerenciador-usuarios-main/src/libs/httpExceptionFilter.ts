import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const timestamp = new Date().toISOString();

    const resposta = exception instanceof HttpException ? exception.getResponse() : exception.message;

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    console.log(`[ERROR] [${timestamp}] ip=${request?.header['x-forwarded-for']} url=${request.url} status=${status} mensagem=${JSON.stringify(resposta)} stack=${exception.stack}`)

    response
      .status(status)
      .json({
        statusCode: status,
        timestamp,
        path: request.url,
        resposta
      });
  }
}
