import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { ThrottlerModule } from '@nestjs/throttler';
import { randomUUID } from 'crypto';
import { LoggerModule } from 'nestjs-pino';

import {
  AdminModule,
  AuthModule,
  CommentsModule,
  ComplaintsModule,
  FilmsModule,
  ReviewsModule,
} from '@/modules';
import { CoreModule, EmailModule, PrismaModule } from '@/shared';

import { AppController } from './app.controller';

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        transport:
          process.env.NODE_ENV === 'production'
            ? undefined
            : {
                target: 'pino-pretty',
                options: {
                  colorize: true,
                  singleLine: true,
                  translateTime: 'yyyy-mm-dd HH:MM:ss.l',
                  ignore:
                    'pid,hostname,req.headers,res.headers,req.remoteAddress,req.remotePort',
                },
              },
        genReqId: (req) => {
          const incoming = req.headers['x-request-id'];
          const id = Array.isArray(incoming) ? incoming[0] : incoming;
          if (id && typeof id === 'string') return id;

          return randomUUID();
        },
        customProps: (req) => ({
          requestId: req.id,
        }),
        serializers: {
          req: (req) => ({
            id: req.id,
            method: req.method,
            url: req.url,
          }),
          res: (res) => ({
            statusCode: res.statusCode,
          }),
        },
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
    TerminusModule,

    // Other modules go here
    CoreModule,
    EmailModule,
    PrismaModule,
    AuthModule,
    AdminModule,
    FilmsModule,
    ReviewsModule,
    CommentsModule,
    ComplaintsModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
