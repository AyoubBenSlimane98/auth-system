import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DATABASE_CONNECTION } from '@infrastructure/database/constants';
import { users } from '@infrastructure/database/schema';
import type { DB, DbTx } from '@infrastructure/database/types';

@Injectable()
export class UsersRepository {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: DB,
  ) {}

  async findByEmail(email: string, tx?: DbTx) {
    const db = tx ?? this.db;
    const result = await db.select().from(users).where(eq(users.email, email));
    return result[0] ?? null;
  }

  async findById(user_id: string) {
    const result = await this.db
      .select()
      .from(users)
      .where(eq(users.user_id, user_id));
    return result[0] ?? null;
  }

  async createUserIfNotExists(
    data: {
      first_name: string;
      last_name: string;
      email: string;
      avatar_url?: string;
    },
    tx?: DbTx,
  ) {
    const db = tx ?? this.db;
    const result = await db
      .insert(users)
      .values({
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        avatar_url: data.avatar_url,
      })
      .onConflictDoNothing({
        target: users.email,
      })
      .returning({ user_id: users.user_id });
    return result[0] ?? null;
  }
}
