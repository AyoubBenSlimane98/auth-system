import { Inject, Injectable } from '@nestjs/common';
import { eq, and } from 'drizzle-orm';
import { DATABASE_CONNECTION } from '@infrastructure/database/constants';
import { sessions } from '@infrastructure/database/schema';
import type { DB, DbTx } from '@infrastructure/database/types';

@Injectable()
export class SessionsRepository {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: DB,
  ) {}

  async revokeLastSession(session_id: string, tx?: DbTx) {
    const db = tx ?? this.db;
    await db
      .update(sessions)
      .set({ is_revoked: true, revoked_at: new Date() })
      .where(eq(sessions.session_id, session_id));
  }

  async lastUsedSession(session_id: string, tx?: DbTx) {
    const db = tx ?? this.db;
    await db
      .update(sessions)
      .set({ last_used_at: new Date() })
      .where(eq(sessions.session_id, session_id));
  }

  async revokeAllUserSessions(provider_id: string, tx?: DbTx) {
    const db = tx ?? this.db;
    return await db
      .update(sessions)
      .set({ is_revoked: true, revoked_at: new Date() })
      .where(
        and(
          eq(sessions.provider_id, provider_id),
          eq(sessions.is_revoked, false),
        ),
      )
      .returning({ session_id: sessions.session_id });
  }

  async createSession(
    data: {
      provider_id: string;
      user_agent: string;
      ip_address: string;
    },
    tx?: DbTx,
  ) {
    const db = tx ?? this.db;
    const [session] = await db
      .insert(sessions)
      .values({
        provider_id: data.provider_id,
        user_agent: data.user_agent,
        ip_address: data.ip_address,
      })
      .returning({
        session_id: sessions.session_id,
      });
    return session;
  }

  async findById(session_id: string) {
    const session = await this.db
      .select({
        provider_id: sessions.provider_id,
        is_revoked: sessions.is_revoked,
      })
      .from(sessions)
      .where(eq(sessions.session_id, session_id));
    return session[0] ?? null;
  }

  async revokeSession(session_id: string, tx?: DbTx) {
    const db = tx ?? this.db;
    await db
      .update(sessions)
      .set({
        is_revoked: true,
        revoked_at: new Date(),
      })
      .where(eq(sessions.session_id, session_id));
  }
}
