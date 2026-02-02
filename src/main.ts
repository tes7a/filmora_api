import {
  BadRequestException,
  ClassSerializerInterceptor,
  ValidationPipe,
} from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { Logger, PinoLogger } from 'nestjs-pino';

import { CoreConfig } from '@/shared';
import { AllExceptionsFilter } from '@/utils';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  app.useLogger(app.get(Logger));

  const pinoLogger = await app.resolve(PinoLogger);
  const coreConfig = app.get(CoreConfig);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      stopAtFirstError: true,
      exceptionFactory: (errors) => {
        const errorsMessages = errors.flatMap((error) => {
          const constraints = error.constraints ?? {};
          return Object.values(constraints).map((message) => ({
            message,
            field: error.property,
          }));
        });
        return new BadRequestException(errorsMessages);
      },
    }),
  );

  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  app.useGlobalFilters(new AllExceptionsFilter(pinoLogger));

  app.use(
    helmet({
      contentSecurityPolicy: false,
    }),
  );

  app.use(compression());

  app.use(cookieParser());

  const origins = coreConfig.corsOrigin
    ? coreConfig.corsOrigin.split(',').map((s) => s.trim())
    : true;

  app.enableCors({
    origin: origins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
    exposedHeaders: ['X-Request-Id'],
  });

  const port = coreConfig.port;
  const env = coreConfig.nodeEnv;

  await app.listen(port);

  pinoLogger.info({ port, env }, 'API started');
}

void bootstrap();
