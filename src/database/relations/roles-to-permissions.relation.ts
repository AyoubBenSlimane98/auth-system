import { relations } from 'drizzle-orm';
import { permissions, roles, rolesToPermissions } from '../schema';

export const rolesToPermissionsRelations = relations(
  rolesToPermissions,
  ({ one }) => ({
    role: one(roles, {
      fields: [rolesToPermissions.role_id],
      references: [roles.role_id],
    }),
    permission: one(permissions, {
      fields: [rolesToPermissions.permission_id],
      references: [permissions.permission_id],
    }),
  }),
);
