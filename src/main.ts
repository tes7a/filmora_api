import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
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

  const port = process.env.PORT ? Number(process.env.PORT) : 3000;
  await app.listen(port);

  pinoLogger.info(
    { port, env: process.env.NODE_ENV ?? 'development' },
    'API started',
  );
}

void bootstrap();
