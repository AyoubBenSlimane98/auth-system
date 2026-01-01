import { Inject, Injectable } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../database/schema';
import { rolesMap } from './constants';

@Injectable()
export class RolesSeeder {
  constructor(
    @Inject('DB')
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async seed() {
    await this.db.insert(schema.roles).values(rolesMap).onConflictDoNothing();
    console.log('All roles seeded successfully!');
  }
}
