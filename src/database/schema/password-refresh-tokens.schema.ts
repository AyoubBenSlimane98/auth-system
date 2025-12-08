import {
  pgTable,
  uuid,
  text,
  timestamp,
  primaryKey,
  foreignKey,
  index,
} from 'drizzle-orm/pg-core';
import { timeDate, users } from './users.schema';

export const passwordRefreshTokens = pgTable(
  'password_refresh_tokens',
  {
    id: uuid('id').defaultRandom().notNull(),
    user_id: uuid('user_id').notNull(),
    token: text('token').notNull(),
    expires_at: timestamp('expires_at', {
      withTimezone: true,
      precision: 0,
    }).notNull(),
    created_at: timeDate.created_at,
  },
  (table) => [
    primaryKey({ name: 'pk_password_refresh_tokens_id', columns: [table.id] }),
    foreignKey({
      name: 'fk_password_refresh_tokens_user_id_users_user_id',
      columns: [table.user_id],
      foreignColumns: [users.user_id],
    })
      .onDelete('cascade')
      .onUpdate('cascade'),
    index('idx_password_refresh_tokens_token').on(table.token),
  ],
);
