import { relations } from 'drizzle-orm';
import {
  authProviders,
  passwordRefreshTokens,
  profiles,
  refreshTokens,
  users,
  usersToRoles,
} from '../schema';

export const usersRelation = relations(users, ({ many, one }) => ({
  usersToRoles: many(usersToRoles),
  profile: one(profiles),
  tokens: many(refreshTokens),
  passwordRefreshTokens: many(passwordRefreshTokens),
  authProviders: many(authProviders),
}));
