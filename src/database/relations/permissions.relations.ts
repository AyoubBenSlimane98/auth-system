import { relations } from 'drizzle-orm';
import { permissions, rolesToPermissions } from '../schema';

export const permissionsRelations = relations(permissions, ({ many }) => ({
  rolesToPermissions: many(rolesToPermissions),
}));
