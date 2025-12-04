import {
  pgTable,
  uuid,
  text,
  primaryKey,
  unique,
  index,
} from 'drizzle-orm/pg-core';
import { timeDate } from './users.schema';

export const roles = pgTable(
  'roles',
  {
    role_id: uuid('role_id').defaultRandom().notNull(),
    name: text('name').notNull(),
    description: text('description'),
    ...timeDate,
  },
  (table) => [
    primaryKey({ name: 'pk_roles_role_id', columns: [table.role_id] }),
    unique('uq_roles_name').on(table.name),
    index('idx_roles_name').on(table.name),
  ],
);
