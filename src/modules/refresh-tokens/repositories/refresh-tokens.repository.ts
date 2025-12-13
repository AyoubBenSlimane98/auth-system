import { Inject, Injectable } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../../database/schema';
import { DATABASE_CONNECTION } from 'src/database/constants';
import { StoreTokenInput, RefreshTokenResponse } from '../interfaces';
import { and, eq, sql } from 'drizzle-orm';

@Injectable()
export class RefreshTokensRepository {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}
  async storeToken(data: StoreTokenInput): Promise<RefreshTokenResponse> {
    const [token] = await this.db
      .insert(schema.refreshTokens)
      .values(data)
      .returning({
        token_id: schema.refreshTokens.token_id,
        created_at: schema.refreshTokens.created_at,
      });
    return token;
  }
  async findTokenById(
    token_id: string,
    user_id: string,
  ): Promise<{
    hash_token: string | null;
  }> {
    const [token] = await this.db
      .select({ hash_token: schema.refreshTokens.token })
      .from(schema.refreshTokens)
      .where(
        and(
          eq(schema.refreshTokens.token_id, token_id),
          eq(schema.refreshTokens.user_id, user_id),
        ),
      );
    return token;
  }
  async deleteTokenById(token_id: string) {
    await this.db
      .delete(schema.refreshTokens)
      .where(eq(schema.refreshTokens.token_id, token_id));
  }

  async findValidToken(
    user_id: string,
    token_id: string,
  ): Promise<{
    hash_token: string | null;
  }> {
    const [token] = await this.db
      .select({ hash_token: schema.refreshTokens.token })
      .from(schema.refreshTokens)
      .where(
        and(
          eq(schema.refreshTokens.user_id, user_id),
          eq(schema.refreshTokens.token_id, token_id),
          sql`${schema.refreshTokens.expires_at} > now()`,
          eq(schema.refreshTokens.is_revoked, false),
        ),
      );
    return token ?? null;
  }
}
