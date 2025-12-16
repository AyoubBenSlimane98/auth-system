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
import { boolean } from 'drizzle-orm/pg-core';

export const passwordResetTokens = pgTable(
  'password_reset_tokens',
  {
    id: uuid('id').defaultRandom().notNull(),
    user_id: uuid('user_id').notNull(),
    token: text('token').notNull(),
    expires_at: timestamp('expires_at', {
      withTimezone: true,
      precision: 0,
    }).notNull(),
    used: boolean('used').default(false),
    created_at: timeDate.created_at,
  },
  (table) => [
    primaryKey({ name: 'pk_password_reset_tokens_id', columns: [table.id] }),
    foreignKey({
      name: 'fk_password_reset_tokens_user_id_users_user_id',
      columns: [table.user_id],
      foreignColumns: [users.user_id],
    })
      .onDelete('cascade')
      .onUpdate('cascade'),
    index('idx_password_reset_tokens_actives').on(table.expires_at, table.used),
  ],
);
