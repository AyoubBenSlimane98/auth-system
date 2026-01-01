import {
  pgTable,
  uuid,
  primaryKey,
  foreignKey,
  index,
} from 'drizzle-orm/pg-core';
import { roles } from './roles.schema';
import { permissions } from './permissions.schema';
import { timeDate } from './users.schema';

export const rolesToPermissions = pgTable(
  'roles_to_permissions',
  {
    role_id: uuid('role_id').notNull(),
    permission_id: uuid('permission_id').notNull(),
    ...timeDate,
  },
  (table) => [
    primaryKey({
      name: 'pk_roles_to_permissions_role_id_permission_id',
      columns: [table.role_id, table.permission_id],
    }),
    foreignKey({
      name: 'fk_roles_to_permissions_role_id_roles_role_id',
      columns: [table.role_id],
      foreignColumns: [roles.role_id],
    })
      .onDelete('cascade')
      .onUpdate('cascade'),
    foreignKey({
      name: 'fk_roles_to_permissions_permission_id_permissions_permission_id',
      columns: [table.permission_id],
      foreignColumns: [permissions.permission_id],
    })
      .onDelete('cascade')
      .onUpdate('cascade'),
    index('idx_roles_to_permissions_role_id').on(table.role_id),
    index('idx_roles_to_permissions_permission_id').on(table.permission_id),
  ],
);
