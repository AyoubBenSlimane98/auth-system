import { relations } from 'drizzle-orm';
import { roles, rolesToPermissions, usersToRoles } from '../schema';

export const rolesRelation = relations(roles, ({ many }) => ({
  usersToRoles: many(usersToRoles),
  rolesToPermissions: many(rolesToPermissions),
}));
