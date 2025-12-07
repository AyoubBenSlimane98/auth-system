import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';
import {
  argonConfig,
  databaseConfig,
  jwtKeyConfig,
} from './configs/configuration';
import { AuthModule } from './modules/auth/auth.module';
import googleConfig from './configs/configuration/google.config';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './modules/auth/guards';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [databaseConfig, argonConfig, jwtKeyConfig, googleConfig],
      expandVariables: true,
    }),
    DatabaseModule,
    AuthModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: JwtAuthGuard }],
})
export class AppModule {}
