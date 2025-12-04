import { relations } from 'drizzle-orm';
import { roles, usersToRoles } from '../schema';

export const rolesRelation = relations(roles, ({ many }) => ({
  usersToRoles: many(usersToRoles),
}));
