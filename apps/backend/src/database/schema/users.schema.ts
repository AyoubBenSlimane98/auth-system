import {
  pgTable,
  text,
  uuid,
  timestamp,
  primaryKey,
  unique,
  index,
} from 'drizzle-orm/pg-core';

export const users = pgTable(
  'users',
  {
    user_id: uuid('user_id').defaultRandom().notNull(),
    email: text('email').notNull(),
    first_name: text('first_name'),
    last_name: text('last_name'),
    avatar_url: text('avatar_url'),
    created_at: timestamp('created_at', {
      withTimezone: true,
      precision: 0,
    }).defaultNow(),
    updated_at: timestamp('updated_at', { withTimezone: true, precision: 0 })
      .defaultNow()
      .$onUpdateFn(() => new Date()),
  },
  (tx) => [
    primaryKey({ name: 'pk_users_user_id', columns: [tx.user_id] }),
    unique('uq_users_email').on(tx.email),
    index('idx_users_full_name').on(tx.first_name, tx.last_name),
  ],
);
