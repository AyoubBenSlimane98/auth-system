import { Inject, Injectable } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../../database/schema';
import { DATABASE_CONNECTION } from 'src/database/constants';
import { eq } from 'drizzle-orm';
import { RegisterDto } from 'src/modules/auth/dtos';
import { ProfilesRepository } from 'src/modules/profiles/repositories';
import { UserResponse } from '../interfaces';
@Injectable()
export class UsersRepository {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: NodePgDatabase<typeof schema>,
    private readonly profilesRepository: ProfilesRepository,
  ) {}
  async emailExists(email: string): Promise<boolean> {
    const [user] = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, email));
    return Boolean(user);
  }

  async findUserByEmail(email: string): Promise<{
    user_id: string;
    password: string | null;
  }> {
    const [user] = await this.db
      .select({
        user_id: schema.users.user_id,
        password: schema.users.password,
      })
      .from(schema.users)
      .where(eq(schema.users.email, email));
    return user ?? null;
  }
  async createUser(data: RegisterDto): Promise<UserResponse> {
    return await this.db.transaction(async (tx) => {
      const {
        email,
        password,
        provider,
        first_name,
        last_name,
        area_code,
        phone_number,
      } = data;
      const [user] = await tx
        .insert(schema.users)
        .values({ email, password, provider })
        .returning({ user_id: schema.users.user_id });
      const profile = await this.profilesRepository.createProfile(
        {
          user_id: user.user_id,
          first_name,
          last_name,
          area_code,
          phone_number,
        },
        tx,
      );
      return {
        user_id: user.user_id,
        profile,
      };
    });
  }

  async changePasswordUser(user_id: string, new_password: string) {
    await this.db
      .update(schema.users)
      .set({ password: new_password })
      .where(eq(schema.users.user_id, user_id));
  }
}
