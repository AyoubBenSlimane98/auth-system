import {
  BadRequestException,
  MiddlewareConsumer,
  Module,
  NestModule,
  ValidationPipe,
} from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';
import {
  appConfig,
  argon2Config,
  databaseConfig,
  googleConfig,
  jwtConfig,
  redisConfig,
  sendGridConfig,
  twitterConfig,
} from './configuration';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ProvidersModule } from './modules/providers/providers.module';
import { SessionsModule } from './modules/sessions/sessions.module';
import { TokensModule } from './modules/tokens/tokens.module';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { JwtAuthGuard } from './modules/auth/guards';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { RedisModule } from './infrastructure/redis/redis.module';
import { RateLimitGuard } from './common/guards/rate-limit.guard';
import { QueueModule } from './infrastructure/queue/queue.module';
import { HttpRedirectMiddleware } from './common/middlewares/http-redirect.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [
        databaseConfig,
        jwtConfig,
        sendGridConfig,
        appConfig,
        argon2Config,
        googleConfig,
        twitterConfig,
        redisConfig,
      ],
      envFilePath: `.env.${process.env.NODE_ENV}`,
      expandVariables: true,
    }),
    DatabaseModule,
    AuthModule,
    UsersModule,
    ProvidersModule,
    SessionsModule,
    TokensModule,
    RedisModule,
    QueueModule,
  ],
  providers: [
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,
        exceptionFactory: (errors) => {
          const formattedErrors: Record<string, string[]> = {};

          errors.forEach((error) => {
            const field = error.property;

            if (error.constraints) {
              formattedErrors[field] = Object.values(error.constraints);
            }
          });
          return new BadRequestException({
            message: 'Validation failed',
            errors: formattedErrors,
          });
        },
      }),
    },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RateLimitGuard },
    { provide: APP_INTERCEPTOR, useClass: ResponseInterceptor },
    { provide: APP_FILTER, useClass: GlobalExceptionFilter },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(HttpRedirectMiddleware).forRoutes('*')
  }
}
