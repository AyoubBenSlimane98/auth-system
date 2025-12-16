import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';
import {
  argonConfig,
  databaseConfig,
  jwtKeyConfig,
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
      ],
      expandVariables: true,
    }),
    DatabaseModule,
    AuthModule,
    UsersModule,
    ProfilesModule,
    RefreshTokensModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_FILTER, useClass: GlobalExceptionFilter },
  ],
})
export class AppModule {}
