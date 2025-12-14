import {
  pgTable,
  pgEnum,
  uuid,
  text,
  primaryKey,
  foreignKey,
  unique,
} from 'drizzle-orm/pg-core';
import { timeDate, users } from './users.schema';
export const authProviderEnum = pgEnum('auth_provider', [
  'local',
  'google',
  'apple',
]);
export const authProviders = pgTable(
  'auth_providers',
  {
    auth_provider_id: uuid('auth_provider_id').defaultRandom().notNull(),
    user_id: uuid('user_id').notNull(),
    provider: authProviderEnum('provider').notNull(),
    provider_user_id: text('provider_user_id').notNull(),
    created_at: timeDate.created_at,
  },
  (table) => [
    primaryKey({
      name: 'pk_auth_providers_auth_provider_id',
      columns: [table.auth_provider_id],
    }),
    foreignKey({
      name: 'fk_auth_providers_user_id_users_user_id',
      columns: [table.user_id],
      foreignColumns: [users.user_id],
    })
      .onDelete('cascade')
      .onUpdate('cascade'),
    unique('uq_provider_user').on(table.provider, table.provider_user_id),
  ],
);
