import {
  pgTable,
  uuid,
  text,
  primaryKey,
  foreignKey,
  unique,
  index,
} from 'drizzle-orm/pg-core';
import { timeDate, users } from './users.schema';

export const profiles = pgTable(
  'profiles',
  {
    profile_id: uuid('profile_id').defaultRandom().notNull(),
    user_id: uuid('user_id').notNull(),
    first_name: text('first_name'),
    last_name: text('last_name'),
    area_code: text('area_code'),
    phone_number: text('phone_number'),
    avatar_url: text('avatar_url'),
    ...timeDate,
  },
  (table) => [
    primaryKey({ name: 'pk_profiles_profile_id', columns: [table.profile_id] }),
    foreignKey({
      name: 'fk_profiles_user_id',
      columns: [table.user_id],
      foreignColumns: [users.user_id],
    })
      .onDelete('cascade')
      .onUpdate('cascade'),
    unique('uq_profiles_user_id').on(table.user_id),
    unique('uq_profiles_phone').on(table.area_code, table.phone_number),
    index('idx_profiles_first_name').on(table.first_name),
    index('idx_profiles_last_name').on(table.last_name),
    index('idx_profiles_full_name').on(table.first_name, table.last_name),
  ],
);
