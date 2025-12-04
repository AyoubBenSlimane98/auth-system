import { relations } from 'drizzle-orm';
import { passwordRefreshTokens, users } from '../schema';

export const passwordRefreshTokensRelation = relations(
  passwordRefreshTokens,
  ({ one }) => ({
    user: one(users, {
      fields: [passwordRefreshTokens.user_id],
      references: [users.user_id],
    }),
  }),
);
