import { Injectable, Inject } from '@nestjs/common';
import { eq, and } from 'drizzle-orm';
import { ProviderEnum } from '@modules/providers/enums';
import { DATABASE_CONNECTION } from '@infrastructure/database/constants';
import { providers } from '@infrastructure/database/schema';
import type { DB, DbTx } from '@infrastructure/database/types';

@Injectable()
export class ProvidersRepository {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: DB,
  ) {}

  async createLocalProviderIfNotExists(
    data: {
      user_id: string;
      hash_password: string;
      type: ProviderEnum;
    },
    tx?: DbTx,
  ) {
    const db = tx ?? this.db;
    const result = await db
      .insert(providers)
      .values({
        user_id: data.user_id,
        hash_password: data.hash_password,
        type: data.type,
      })
      .onConflictDoNothing({
        target: [providers.user_id, providers.type],
      })
      .returning({
        provider_id: providers.provider_id,
        user_id: providers.user_id,
      });

    return result[0] ?? null;
  }

  async createProviderIfNotExists(
    data: {
      user_id: string;
      provider_user_id: string;
      type: ProviderEnum;
    },
    tx?: DbTx,
  ) {
    const db = tx ?? this.db;
    const inserted = await db
      .insert(providers)
      .values({
        user_id: data.user_id,
        provider_user_id: data.provider_user_id,
        type: data.type,
        is_email_verified: true,
      })
      .onConflictDoNothing({
        target: [providers.provider_user_id, providers.type],
      })
      .returning({
        provider_id: providers.provider_id,
        user_id: providers.user_id,
      });
    return inserted[0] ?? null;
  }

  async markAccountAsVerified(provider_id: string, type: ProviderEnum) {
    await this.db
      .update(providers)
      .set({ is_email_verified: true })
      .where(
        and(eq(providers.provider_id, provider_id), eq(providers.type, type)),
      );
  }

  async findByUserIdAndType(user_id: string, type: ProviderEnum) {
    const result = await this.db
      .select({
        provider_id: providers.provider_id,
        user_id: providers.user_id,
        hash_password: providers.hash_password,
        is_email_verified: providers.is_email_verified,
      })
      .from(providers)
      .where(and(eq(providers.user_id, user_id), eq(providers.type, type)));
    return result[0] ?? null;
  }

  async findByProviderUserId(provider_user_id: string, tx?: DbTx) {
    const db = tx ?? this.db;
    const result = await db
      .select({
        provider_id: providers.provider_id,
        user_id: providers.user_id,
      })
      .from(providers)
      .where(eq(providers.provider_user_id, provider_user_id));
    return result[0] ?? null;
  }

  async changePassword(
    data: { hash_passowrd: string; provider_id: string; type: ProviderEnum },
    tx?: DbTx,
  ) {
    const db = tx ?? this.db;
    await db
      .update(providers)
      .set({ hash_password: data.hash_passowrd })
      .where(
        and(
          eq(providers.provider_id, data.provider_id),
          eq(providers.type, data.type),
        ),
      );
  }

  async findById(provider_id: string) {
    const result = await this.db
      .select()
      .from(providers)
      .where(eq(providers.provider_id, provider_id));
    return result[0] ?? null;
  }
}
