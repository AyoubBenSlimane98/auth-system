import { Inject, Injectable } from '@nestjs/common';
import { NodePgDatabase, NodePgTransaction } from 'drizzle-orm/node-postgres';
import * as schema from '../../../database/schema';
import { DATABASE_CONNECTION } from 'src/database/constants';
import { AuthProvider } from 'src/common/enum';

@Injectable()
export class AuthProvidersRepository {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}
  async create(
    data: {
      user_id: string;
      provider: AuthProvider;
      provider_user_id: string;
    },
    tx?: NodePgTransaction<any, any>,
  ) {
    return await (tx || this.db)
      .insert(schema.authProviders)
      .values({
        user_id: data.user_id,
        provider: data.provider,
        provider_user_id: data.provider_user_id,
      })
      .returning({ auth_provider_id: schema.authProviders.auth_provider_id });
  }
}
