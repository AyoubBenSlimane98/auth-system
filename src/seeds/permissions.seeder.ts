import { Inject, Injectable } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../database/schema';
import { permissionsMap } from './constants';

@Injectable()
export class PermissionsSeeder {
  constructor(
    @Inject('DB')
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async seed() {
    const rows = Object.entries(permissionsMap).flatMap(([resource, actions]) =>
      actions.map((action) => ({ resource, action })),
    );
    await this.db.insert(schema.permissions).values(rows).onConflictDoNothing();
    console.log('All permissions seeded successfully!');
  }
}
