import { Inject, Injectable } from '@nestjs/common';
import { NodePgDatabase, NodePgTransaction } from 'drizzle-orm/node-postgres';
import * as schema from '../../../database/schema';
import { DATABASE_CONNECTION } from 'src/database/constants';
import { CreateProfileInput, ProfileResponse } from '../interfaces';

@Injectable()
export class ProfilesRepository {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}
  async createProfile(
    data: CreateProfileInput,
    tx?: NodePgTransaction<any, any>,
  ): Promise<ProfileResponse> {
    const [insertedProfile] = await (tx || this.db)
      .insert(schema.profiles)
      .values(data)
      .returning({
        profile_id: schema.profiles.profile_id,
        created_at: schema.profiles.created_at,
      });
    const profile: ProfileResponse = {
      ...insertedProfile,
      full_name: `${data.first_name} ${data.last_name}`,
    };
    return profile;
  }
}
