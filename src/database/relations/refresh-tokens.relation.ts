import { relations } from 'drizzle-orm';
import { refreshTokens, users } from '../schema';

export const refreshTokensRelation = relations(refreshTokens, ({ one }) => ({
  users: one(users, {
    fields: [refreshTokens.user_id],
    references: [users.user_id],
  }),
}));
