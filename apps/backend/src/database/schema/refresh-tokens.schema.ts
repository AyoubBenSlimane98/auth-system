import {
  pgTable,
  text,
  uuid,
  boolean,
  timestamp,
  primaryKey,
  foreignKey,
  index,
} from 'drizzle-orm/pg-core';
import { sessions } from './sessions.schema';
import { sql } from 'drizzle-orm';

export const refreshTokens = pgTable(
  'refresh_tokens',
  {
    token_id: uuid('token_id').defaultRandom().notNull(),
    session_id: uuid('session_id').notNull(),
    token_hash: text('token_hash').notNull(),
    expires_at: timestamp('expires_at', {
      withTimezone: true,
      precision: 0,
    }).notNull(),
    is_revoked: boolean('is_revoked').default(false),
    revoked_at: timestamp('revoked_at', {
      withTimezone: true,
      precision: 0,
    }),
    created_at: timestamp('created_at', {
      withTimezone: true,
      precision: 0,
    }).defaultNow(),
  },
  (tx) => [
    primaryKey({
      name: 'pk_refresh_tokens_token_id',
      columns: [tx.token_id],
    }),
    foreignKey({
      name: 'fk_refresh_tokens_session_id_sessions',
      columns: [tx.session_id],
      foreignColumns: [sessions.session_id],
    })
      .onDelete('cascade')
      .onUpdate('cascade'),
    index('idx_refresh_tokens_session_id').on(tx.session_id),
    index('idx_refresh_tokens_active')
      .on(tx.session_id, tx.expires_at)
      .where(sql`${tx.is_revoked}=false`),
  ],
);
