import { Inject, Injectable } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../../database/schema';
import { DATABASE_CONNECTION } from 'src/database/constants';
import { AuthProvider } from '../dtos';

@Injectable()
export class AuthProvidersRepository {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}
  async create(data: {
    user_id: string;
    provider: AuthProvider;
    provider_user_id: string;
  }) {
    await this.db.insert(schema.authProviders).values(data);
  }
}
