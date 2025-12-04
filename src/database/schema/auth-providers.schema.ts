import {
  pgTable,
  uuid,
  text,
  primaryKey,
  foreignKey,
  unique,
} from 'drizzle-orm/pg-core';
import { authProviderEnum, timeDate, users } from './users.schema';

export const authProviders = pgTable(
  'auth-providers',
  {
    auth_provider_id: uuid('auth_provider_id ').defaultRandom().notNull(),
    user_id: uuid('user_id').notNull(),
    provider: authProviderEnum('provider').notNull(),
    provider_user_id: text('provider_user_id').notNull(),
    created_at: timeDate.created_at,
  },
  (table) => [
    primaryKey({
      name: 'pk_auth-providers_auth_provider_id',
      columns: [table.auth_provider_id],
    }),
    foreignKey({
      name: 'fk_auth-providers_user_id_users_user_id',
      columns: [table.user_id],
      foreignColumns: [users.user_id],
    })
      .onDelete('cascade')
      .onUpdate('cascade'),
    unique('uq_provider_user').on(table.provider, table.provider_user_id),
  ],
);
