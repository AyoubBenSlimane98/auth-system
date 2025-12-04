import { relations } from 'drizzle-orm';
import { authProviders, users } from '../schema';

export const authProvidersRelations = relations(authProviders, ({ one }) => ({
  user: one(users, {
    fields: [authProviders.user_id],
    references: [users.user_id],
  }),
}));
