import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../../database/schema';
import { DATABASE_CONNECTION } from 'src/database/constants';
import { and, eq } from 'drizzle-orm';
import { RegisterDto } from 'src/modules/auth/dtos';
import { ProfilesRepository } from 'src/modules/profiles/repositories';
import { UserResponse } from '../interfaces';
import { AuthProvidersRepository } from 'src/modules/auth/repositories';
import { AuthProvider, Roles } from 'src/common/enum';
import { UsersRolesRepository } from './users-roles.repository';
import { RolesRepository } from 'src/modules/roles/repositories';
@Injectable()
export class UsersRepository {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: NodePgDatabase<typeof schema>,
    private readonly profilesRepository: ProfilesRepository,
    @Inject(forwardRef(() => AuthProvidersRepository))
    private readonly authProvidersRepository: AuthProvidersRepository,
    private readonly usersRolesRepository: UsersRolesRepository,
    private readonly rolesRepository: RolesRepository,
  ) {}
  async emailExists(email: string): Promise<boolean> {
    const [user] = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, email));
    return Boolean(user);
  }
  async findUserById(userId: string): Promise<{
    user_id: string;
  }> {
    const [user] = await this.db
      .select({
        user_id: schema.users.user_id,
      })
      .from(schema.users)
      .where(eq(schema.users.user_id, userId));
    if (!user || !user.user_id) {
      throw new NotFoundException({
        message: `User with id ${userId} not found`,
      });
    }
    return user;
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
        first_name,
        last_name,
        area_code,
        phone_number,
      } = data;
      const [user] = await tx
        .insert(schema.users)
        .values({ email, password })
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
  async createGoogleUser(data: {
    email: string;
    first_name: string;
    last_name: string;
    provider_user_id: string;
  }) {
    return await this.db.transaction(async (tx) => {
      const { email, first_name, last_name, provider_user_id } = data;
      const [existingProvider] = await tx
        .select()
        .from(schema.authProviders)
        .where(
          and(
            eq(schema.authProviders.provider, AuthProvider.google),
            eq(schema.authProviders.provider_user_id, provider_user_id),
          ),
        );

      if (existingProvider) {
        return { user_id: existingProvider.user_id };
      }
      const [user] = await tx
        .insert(schema.users)
        .values({ email, is_email_verified: true })
        .returning({ user_id: schema.users.user_id });

      await this.authProvidersRepository.create(
        {
          user_id: user.user_id,
          provider: AuthProvider.google,
          provider_user_id,
        },
        tx,
      );
      const role = await this.rolesRepository.findOneByName(Roles.USER);

      await this.usersRolesRepository.assign(user.user_id, {
        roles: [role.role_id],
      });
      const profile = await this.profilesRepository.createProfile(
        {
          user_id: user.user_id,
          first_name,
          last_name,
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
