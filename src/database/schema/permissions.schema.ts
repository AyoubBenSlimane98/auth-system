import {
  pgTable,
  pgEnum,
  uuid,
  text,
  primaryKey,
  unique,
} from 'drizzle-orm/pg-core';
import { timeDate } from './users.schema';
import { Action } from 'src/common/enum';

const actionsTuple = [
  Action.READ,
  Action.CREATE,
  Action.UPDATE,
  Action.DELETE,
  Action.ASSIGN_ROLES,
  Action.ASSIGN_PERMISSIONS,
] as const;

export const actionsEnum = pgEnum('actions', actionsTuple);
export const permissions = pgTable(
  'permissions',
  {
    permission_id: uuid('permission_id').defaultRandom().notNull(),
    resource: text('resource').notNull(),
    action: actionsEnum('action').notNull(),
    created_at: timeDate.created_at,
  },
  (table) => [
    primaryKey({
      name: 'pk_permissions_permission_id',
      columns: [table.permission_id],
    }),
    unique('uq_permissions_resource_action').on(table.resource, table.action),
  ],
);
