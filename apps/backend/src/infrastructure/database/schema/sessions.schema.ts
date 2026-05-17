import {
  pgTable,
  text,
  uuid,
  timestamp,
  boolean,
  primaryKey,
  foreignKey,
  index,
  inet,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { providers } from './providers.schema';

export const sessions = pgTable(
  'sessions',
  {
    session_id: uuid('session_id').defaultRandom().notNull(),
    provider_id: uuid('provider_id').notNull(),

    user_agent: text('user_agent'),
    ip_address: inet('ip_address'),

    is_revoked: boolean('is_revoked').default(false),

    created_at: timestamp('created_at', {
      withTimezone: true,
      precision: 0,
    }).defaultNow(),
    revoked_at: timestamp('revoked_at', {
      withTimezone: true,
      precision: 0,
    }),
    last_used_at: timestamp('last_used_at', {
      withTimezone: true,
      precision: 0,
    }).default(sql`NULL`),
  },
  (tx) => [
    primaryKey({ name: 'pk_sessions_session_id', columns: [tx.session_id] }),

    foreignKey({
      name: 'fk_sessions_provider_id_providers',
      columns: [tx.provider_id],
      foreignColumns: [providers.provider_id],
    })
      .onDelete('cascade')
      .onUpdate('cascade'),
    index('idx_sessions_provider_id').on(tx.provider_id),
    index('idx_sessions_user_active')
      .on(tx.provider_id, tx.is_revoked)
      .where(sql`${tx.is_revoked}=false`),
  ],
);
