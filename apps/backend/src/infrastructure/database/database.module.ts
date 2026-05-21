import { Global, Inject, Module, OnApplicationShutdown } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import {
  DATABASE_CONNECTION,
  DATABASE_POOL,
} from '@infrastructure/database/constants';
import * as schema from '@infrastructure/database/schema';
import { DatabaseType } from '@configuration/types';
import { LoggerService } from '@infrastructure/logs/logger.service';
@Global()
@Module({
  providers: [
    {
      provide: DATABASE_POOL,
      inject: [ConfigService, LoggerService],
      useFactory: (config: ConfigService, logger: LoggerService) => {
        const db = config.getOrThrow<DatabaseType>('database');

        const pool = new Pool({
          connectionString: db.url,
          max: 20,
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 5000,
        });

        const context = 'PostgreSQL';

        pool.on('connect', () => {
          logger.log(context, 'pool connected');
        });

        pool.on('error', (err) => {
          logger.logError(context, 'Unexpected error', err);
        });
        return pool;
      },
    },
    {
      provide: DATABASE_CONNECTION,
      inject: [DATABASE_POOL],
      useFactory: (pool: Pool) => {
        return drizzle(pool, { schema });
      },
    },
  ],
  exports: [DATABASE_POOL, DATABASE_CONNECTION],
})
export class DatabaseModule implements OnApplicationShutdown {
  private context: string = 'PostgreSQL';
  constructor(
    @Inject(DATABASE_POOL) private readonly pool: Pool,
    private readonly logger: LoggerService,
  ) {}
  async onApplicationShutdown() {
    try {
      await this.pool.end();

      this.logger.log(this.context, 'pool closed');
    } catch (err) {
      this.logger.logError(this.context, 'Error shutting down DB pool', err);
    }
  }
}
