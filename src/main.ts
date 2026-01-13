import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import compression from 'compression';
import helmet from 'helmet';
import { PinoLogger } from 'nestjs-pino';

import { AllExceptionsFilter } from '@/utils';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  // Use nestjs-pino Logger (singleton, implements LoggerService)
  const pinoLogger = await app.resolve(PinoLogger);

  // ValidationPipe globally
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // ClassSerializerInterceptor globally
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  // Unified errors
  app.useGlobalFilters(new AllExceptionsFilter(pinoLogger));

  // If you are behind a reverse proxy (nginx, render, fly, etc.)
  // uncomment so req.ip and rate-limit work correctly
  // app.set('trust proxy', 1);

  // Security headers
  app.use(
    helmet({
      // Swagger uses inline scripts/styles sometimes — if you enable Swagger later,
      // you may need to tune CSP. For now we disable it to avoid dev pain.
      contentSecurityPolicy: false,
    }),
  );

  // Gzip/br compression
  app.use(compression());

  // CORS (configure origins via env)
  // Example: CORS_ORIGIN=http://localhost:3000,http://localhost:3001
  const origins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map((s) => s.trim())
    : true; // dev: allow all

  app.enableCors({
    origin: origins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
    exposedHeaders: ['X-Request-Id'],
  });

  const port = process.env.PORT ? Number(process.env.PORT) : 3000;
  await app.listen(port);

  pinoLogger.info(
    { port, env: process.env.NODE_ENV ?? 'development' },
    'API started',
  );
}

void bootstrap();
