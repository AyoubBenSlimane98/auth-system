import { Global, Module, OnApplicationShutdown } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';
import * as relations from './relations';
import { DATABASE_CONNECTION } from './constants';
@Global()
@Module({
  providers: [
    {
      provide: DATABASE_CONNECTION,
      useFactory: (config: ConfigService, dbModule: DatabaseModule) => {
        const pool = new Pool({
          connectionString: config.getOrThrow<string>('database.url'),
          max: 20,
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 5000,
        });
        dbModule.setPool(pool);

        return drizzle(pool, {
          schema: { ...schema, ...relations },
        });
      },
      inject: [ConfigService, DatabaseModule],
    },
  ],
  exports: [DATABASE_CONNECTION],
})
export class DatabaseModule implements OnApplicationShutdown {
  private pool: Pool;
  setPool(pool: Pool) {
    this.pool = pool;
  }
  async onApplicationShutdown() {
    if (this.pool) {
      await this.pool.end();
    }
  }
}
