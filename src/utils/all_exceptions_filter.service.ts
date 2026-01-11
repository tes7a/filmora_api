import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { PinoLogger } from 'nestjs-pino';

@Catch()
class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly logger: PinoLogger) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const req = ctx.getRequest<Request & { id?: string }>();
    const res = ctx.getResponse<Response>();

    const requestId =
      req.id ?? (req.headers['x-request-id'] as string | undefined);

    const isHttp = exception instanceof HttpException;
    const status = isHttp
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const responseBody = isHttp ? exception.getResponse() : null;

    let message: string | string[] = 'Internal server error';
    let error: string | undefined;

    if (typeof responseBody === 'string') {
      message = responseBody;
    } else if (responseBody && typeof responseBody === 'object') {
      const rb = responseBody as any;
      if (rb.message) message = rb.message;
      if (rb.error) error = rb.error;
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    const payload = {
      statusCode: status,
      error: error ?? (isHttp ? exception.name : 'InternalServerError'),
      message,
      path: req.originalUrl ?? req.url,
      method: req.method,
      timestamp: new Date().toISOString(),
      requestId,
    };

    if (status >= 500) {
      this.logger.error(
        {
          err: exception,
          requestId,
          path: payload.path,
          method: payload.method,
        },
        'Unhandled exception',
      );
    } else {
      this.logger.warn(
        { requestId, path: payload.path, method: payload.method, status },
        'Request error',
      );
    }

    res.status(status).json(payload);
  }
}
export { AllExceptionsFilter };
