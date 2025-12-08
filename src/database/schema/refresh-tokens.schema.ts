import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  primaryKey,
  foreignKey,
  index,
} from 'drizzle-orm/pg-core';
import { timeDate, users } from './users.schema';
import { sql } from 'drizzle-orm';

export const refreshTokens = pgTable(
  'refresh_tokens',
  {
    token_id: uuid('token_id').defaultRandom().notNull(),
    user_id: uuid('user_id').notNull(),
    token: text('token'),
    expires_at: timestamp('expires_at', {
      withTimezone: true,
      precision: 0,
    }).notNull(),
    is_revoked: boolean('is_revoked').default(false),
    ...timeDate,
  },
  (table) => [
    primaryKey({
      name: 'pk_refresh_tokens_token_id',
      columns: [table.token_id],
    }),
    foreignKey({
      name: 'fk_refresh_tokens_user_id',
      columns: [table.user_id],
      foreignColumns: [users.user_id],
    })
      .onDelete('cascade')
      .onUpdate('cascade'),
    index('idx_refresh_tokens_token').on(table.token),
    index('idx_refresh_tokens_active')
      .on(table.token)
      .where(sql`${table.is_revoked} = false`),
  ],
);
