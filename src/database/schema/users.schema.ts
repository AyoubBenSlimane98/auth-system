import {
  uuid,
  text,
  boolean,
  timestamp,
  primaryKey,
  unique,
  index,
} from 'drizzle-orm/pg-core';
import { pgTable } from 'drizzle-orm/pg-core';

export const timeDate = {
  created_at: timestamp('created_at', {
    withTimezone: true,
    precision: 0,
  }).defaultNow(),
  updated_at: timestamp('updated_at', {
    withTimezone: true,
    precision: 0,
  })
    .defaultNow()
    .$onUpdateFn(() => new Date()),
};
export const users = pgTable(
  'users',
  {
    user_id: uuid('user_id').defaultRandom().notNull(),
    email: text('email').notNull(),
    password: text('password'),
    is_email_verified: boolean('is_email_verified').default(false),
    ...timeDate,
  },
  (table) => [
    primaryKey({ name: 'pk_users_user_id', columns: [table.user_id] }),
    unique('uq_users_email').on(table.email),
    index('idx_users_email').on(table.email),
  ],
);
