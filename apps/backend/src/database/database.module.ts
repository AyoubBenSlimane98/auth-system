import { Inject, Module, OnApplicationShutdown } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool } from 'pg';
import { DatabaseType } from '../configuration/types';
import { drizzle } from 'drizzle-orm/node-postgres';
import { DATABASE_CONNECTION, DATABASE_POOL } from './constants';
import * as tables from './schema';

@Module({
  providers: [
    {
      provide: DATABASE_POOL,
      useFactory: (config: ConfigService) => {
        const db = config.getOrThrow<DatabaseType>('database');
        const pool = new Pool({
          connectionString: db.url,
          max: 20,
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 5000,
        });
        pool.on('connect', () => {
          console.log('PostgreSQL pool connected');
        });
        pool.on('error', (err) => {
          console.error('Unexpected PostgreSQL error', err);
        });
        return pool;
      },
    },
    {
      provide: DATABASE_CONNECTION,
      inject: [DATABASE_POOL],
      useFactory: (pool: Pool) => {
        return drizzle(pool, { schema: { ...tables } });
      },
    },
  ],
  exports: [DATABASE_POOL, DATABASE_CONNECTION],
})
export class DatabaseModule implements OnApplicationShutdown {
  constructor(@Inject(DATABASE_POOL) private readonly pool: Pool) {}
  async onApplicationShutdown() {
    try {
      await this.pool.end();
      console.log('PostgreSQL pool closed');
    } catch (err) {
      console.error('Error shutting down DB pool', err);
    }
  }
}
