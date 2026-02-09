import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { PinoLogger } from 'nestjs-pino';

interface ValidationError {
  message: string;
  field: string;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly logger: PinoLogger) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const req = ctx.getRequest<Request & { id?: string }>();
    const res = ctx.getResponse<Response>();

    if (res.headersSent) return;

    const requestId =
      req.id ?? (req.headers['x-request-id'] as string | undefined);
    const path = req.originalUrl ?? req.url;
    const method = req.method;

    const isHttp = exception instanceof HttpException;
    const status = isHttp
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    if (status >= 500) {
      this.logger.error(
        { err: exception, requestId, path, method },
        'Unhandled exception',
      );
    } else {
      this.logger.warn({ requestId, path, method, status }, 'Request error');
    }

    if (
      status === HttpStatus.BAD_REQUEST &&
      exception instanceof BadRequestException
    ) {
      const responseBody = exception.getResponse();

      if (typeof responseBody === 'object' && responseBody !== null) {
        const body = responseBody as { message?: ValidationError[] | string };

        if (Array.isArray(body.message)) {
          return res.status(status).json({
            errorsMessages: body.message,
          });
        }

        if (typeof body.message === 'string') {
          const field = (responseBody as { field?: string }).field;
          return res.status(status).json({
            errorsMessages: [
              { message: body.message, field: field ?? 'unknown' },
            ],
          });
        }
      }
    }

    if (isHttp) {
      const responseBody = exception.getResponse();
      let message = exception.message;

      if (typeof responseBody === 'object' && responseBody !== null) {
        const body = responseBody as { message?: string };
        if (typeof body.message === 'string') {
          message = body.message;
        }
      }

      return res.status(status).json({
        statusCode: status,
        message,
      });
    }

    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
    });
  }
}
