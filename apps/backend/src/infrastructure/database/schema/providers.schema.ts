import {
  pgTable,
  pgEnum,
  uuid,
  text,
  timestamp,
  boolean,
  primaryKey,
  foreignKey,
  unique,
  index,
} from 'drizzle-orm/pg-core';
import { users } from './users.schema';

export const typeProviderEnum = pgEnum('type_provider', [
  'local',
  'google',
  'apple',
  'twitter',
]);
export const providers = pgTable(
  'providers',
  {
    provider_id: uuid('provider_id').defaultRandom().notNull(),
    user_id: uuid('user_id').notNull(),
    type: typeProviderEnum('type').notNull(),
    provider_user_id: text('provider_user_id'),
    hash_password: text('hash_password'),
    is_email_verified: boolean('is_email_verified').default(false),
    created_at: timestamp('created_at', {
      withTimezone: true,
      precision: 0,
    }).defaultNow(),
  },
  (tx) => [
    primaryKey({
      name: 'pk_providers_provider_id',
      columns: [tx.provider_id],
    }),
    foreignKey({
      name: 'fk_providers_user_id_users',
      columns: [tx.user_id],
      foreignColumns: [users.user_id],
    })
      .onDelete('cascade')
      .onUpdate('cascade'),

    unique('uq_provider_per_account').on(tx.type, tx.provider_user_id),
    unique('uq_user_local_provider').on(tx.user_id, tx.type),

    index('idx_providers_user_id').on(tx.user_id),
    index('idx_providers_verified').on(tx.user_id, tx.is_email_verified),
  ],
);
