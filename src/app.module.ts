import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { randomUUID } from 'crypto';
import { LoggerModule } from 'nestjs-pino';

import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        genReqId: (req) => {
          const incoming = req.headers['x-request-id'];
          const id = Array.isArray(incoming) ? incoming[0] : incoming;
          if (id && typeof id === 'string') return id;

          return randomUUID();
        },
        customProps: (req) => ({
          requestId: req.id,
        }),
        level:
          process.env.NODE_ENV === 'production'
            ? 'info'
            : process.env.NODE_ENV === 'test'
              ? 'silent'
              : 'debug',
        redact: {
          paths: [
            'req.headers.authorization',
            'req.headers.cookie',
            'res.headers["set-cookie"]',
          ],
          remove: true,
        },
      },
    }),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000,
          limit: 10,
        },
      ],
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
