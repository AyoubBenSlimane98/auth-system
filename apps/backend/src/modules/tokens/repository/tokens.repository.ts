import { Injectable, Inject } from '@nestjs/common';
import { eq, and, desc, inArray } from 'drizzle-orm';
import { ConfigService } from '@nestjs/config';
import ms from 'ms';
import { JwtType } from '@configuration/types';
import { DATABASE_CONNECTION } from '@infrastructure/database/constants';
import { tokens, sessions } from '@infrastructure/database/schema';
import type { DB, DbTx } from '@infrastructure/database/types';
@Injectable()
export class TokensRepository {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: DB,
    private readonly config: ConfigService,
  ) {}

  async createRefreshToken(
    data: {
      session_id: string;
      token_hash: string;
    },
    tx?: DbTx,
  ) {
    const db = tx ?? this.db;
    const jwt = this.config.getOrThrow<JwtType>('jwt');
    const expires_at = new Date(Date.now() + ms(jwt.auth.refresh_token_ttl));

    await db
      .insert(tokens)
      .values({
        session_id: data.session_id,
        token_hash: data.token_hash,
        expires_at,
      })
      .returning({ token_id: tokens.token_id });
  }

  async findLatestRefreshTokenBySession(session_id: string) {
    const result = await this.db
      .select()
      .from(tokens)
      .where(eq(tokens.session_id, session_id))
      .orderBy(desc(tokens.created_at))
      .limit(1);
    return result[0] ?? null;
  }

  async revokeToken(token_id: string, tx?: DbTx) {
    const db = tx ?? this.db;

    await db
      .update(tokens)
      .set({
        is_revoked: true,
        revoked_at: new Date(),
      })
      .where(eq(tokens.token_id, token_id));
  }

  async revokeAllUserTokens(provider_id: string, tx?: DbTx) {
    const db = tx ?? this.db;

    await db
      .update(tokens)
      .set({
        is_revoked: true,
        revoked_at: new Date(),
      })
      .where(
        and(
          inArray(
            tokens.session_id,
            db
              .select({ session_id: sessions.session_id })
              .from(sessions)
              .where(eq(sessions.provider_id, provider_id)),
          ),
          eq(tokens.is_revoked, false),
        ),
      );
  }
}
