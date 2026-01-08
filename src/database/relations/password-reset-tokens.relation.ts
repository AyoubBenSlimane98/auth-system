import { relations } from 'drizzle-orm';
import { passwordResetTokens, users } from '../schema';

export const passwordRefreshTokensRelation = relations(
  passwordResetTokens,
  ({ one }) => ({
    user: one(users, {
      fields: [passwordResetTokens.user_id],
      references: [users.user_id],
    }),
  }),
);
