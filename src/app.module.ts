import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';
import {
  argonConfig,
  databaseConfig,
  jwtKeyConfig,
} from './configs/configuration';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [databaseConfig, argonConfig, jwtKeyConfig],
      expandVariables: true,
    }),
    DatabaseModule,
    AuthModule,
  ],
})
export class AppModule {}
