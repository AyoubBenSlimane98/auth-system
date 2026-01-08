import { Inject, Injectable } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../../database/schema';
import { DATABASE_CONNECTION } from 'src/database/constants';
import { eq, sql, and } from 'drizzle-orm';

@Injectable()
export class PasswordResetTokensRepository {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async saveTokenPassword(user_id: string, token: string, expires_at: Date) {
    await this.db
      .insert(schema.passwordResetTokens)
      .values({ user_id, token, expires_at });
  }
  async findValidTokens(): Promise<
    {
      id: string;
      user_id: string;
      token: string;
    }[]
  > {
    const tokens = await this.db
      .select({
        id: schema.passwordResetTokens.id,
        user_id: schema.passwordResetTokens.user_id,
        token: schema.passwordResetTokens.token,
      })
      .from(schema.passwordResetTokens)
      .where(
        and(
          eq(schema.passwordResetTokens.used, false),
          sql`${schema.passwordResetTokens.expires_at} > now()`,
        ),
      );
    return tokens;
  }
  async markAsUsed(id: string) {
    await this.db
      .update(schema.passwordResetTokens)
      .set({ used: true })
      .where(eq(schema.passwordResetTokens.id, id));
  }
}
