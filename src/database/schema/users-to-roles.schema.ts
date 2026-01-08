import {
  pgTable,
  uuid,
  primaryKey,
  foreignKey,
  index,
} from 'drizzle-orm/pg-core';
import { timeDate, users } from './users.schema';
import { roles } from './roles.schema';

export const usersToRoles = pgTable(
  'users_to_roles',
  {
    user_id: uuid('user_id').notNull(),
    role_id: uuid('role_id').notNull(),
    ...timeDate,
  },
  (table) => [
    primaryKey({
      name: 'pk_users_to_roles',
      columns: [table.user_id, table.role_id],
    }),
    foreignKey({
      name: 'fk_users_to_roles_user_id_users_user_id',
      columns: [table.user_id],
      foreignColumns: [users.user_id],
    })
      .onDelete('cascade')
      .onUpdate('cascade'),
    foreignKey({
      name: 'fk_users_to_roles_role_id_roles_role_id',
      columns: [table.role_id],
      foreignColumns: [roles.role_id],
    })
      .onDelete('cascade')
      .onUpdate('cascade'),
    index('idx_users_to_roles_user_id').on(table.user_id),
    index('idx_users_to_roles_role_id').on(table.role_id),
  ],
);
