import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';
import { databaseConfig } from './configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [databaseConfig],
      envFilePath: `.env.${process.env.NODE_ENV}`,
      expandVariables: true,
    }),
    DatabaseModule,
  ],
  providers: [],
})
export class AppModule {}
