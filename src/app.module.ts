import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';
import {
  argonConfig,
  databaseConfig,
  jwtKeyConfig,
  redisConfig,
  sgMailConfig,
} from './configs/configuration';
import { AuthModule } from './modules/auth/auth.module';
import googleConfig from './configs/configuration/google.config';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './modules/auth/guards';
import { UsersModule } from './modules/users/users.module';
import { ProfilesModule } from './modules/profiles/profiles.module';
import { RefreshTokensModule } from './modules/refresh-tokens/refresh-tokens.module';
import { GlobalExceptionFilter } from './common/filters';
import { envDevSchema, envProdSchema } from './configs/environment';
import { RolesModule } from './modules/roles/roles.module';
import { SeedsModule } from './seeds/seeds.module';
import { PermissionGuard } from './common/guards';
import { RedisModule } from './common/redis/redis.module';
import { GlobalRateLimitMiddleware } from './common/middleware';

const nodeEnv = process.env.NODE_ENV ?? 'development';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [
        databaseConfig,
        argonConfig,
        jwtKeyConfig,
        googleConfig,
        sgMailConfig,
        redisConfig,
      ],
      envFilePath: [`.env.${nodeEnv}.local`, '.env'],
      expandVariables: true,
      validationSchema: nodeEnv === 'production' ? envProdSchema : envDevSchema,
      validationOptions: {
        allowUnknown: true,
        abortEarly: nodeEnv === 'production',
      },
    }),
    DatabaseModule,
    AuthModule,
    UsersModule,
    ProfilesModule,
    RefreshTokensModule,
    RolesModule,
    SeedsModule,
    RedisModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: PermissionGuard },
    { provide: APP_FILTER, useClass: GlobalExceptionFilter },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(GlobalRateLimitMiddleware).forRoutes('*');
  }
}
