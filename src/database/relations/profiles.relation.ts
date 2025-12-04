import { relations } from 'drizzle-orm';
import { profiles, users } from '../schema';

export const profilesRelation = relations(profiles, ({ one }) => ({
  user: one(users, { fields: [profiles.user_id], references: [users.user_id] }),
}));
