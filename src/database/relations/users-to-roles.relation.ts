import { relations } from 'drizzle-orm';
import { roles, users, usersToRoles } from '../schema';

export const usersToRolesRelation = relations(usersToRoles, ({ one }) => ({
  user: one(users, {
    fields: [usersToRoles.user_id],
    references: [users.user_id],
  }),
  role: one(roles, {
    fields: [usersToRoles.role_id],
    references: [roles.role_id],
  }),
}));
