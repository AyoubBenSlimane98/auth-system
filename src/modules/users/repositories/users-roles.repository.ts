import { Inject, Injectable } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../../database/schema';
import { DATABASE_CONNECTION } from 'src/database/constants';
import { UsersRepository } from './users.repository';
import { AssignRolesDto } from '../dto';
@Injectable()
export class UsersRolesRepository {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: NodePgDatabase<typeof schema>,
    private readonly usersRepository: UsersRepository,
  ) {}

  async assign(userId: string, dto: AssignRolesDto) {
    await this.usersRepository.findUserById(userId);
    const rows = dto.roles.map((roleId) => ({
      user_id: userId,
      role_id: roleId,
    }));
    console.log(rows);
    const result = await this.db
      .insert(schema.usersToRoles)
      .values(rows)
      .onConflictDoNothing();
    console.log('result', result);
    const assigned = result.rowCount ?? 0;
    const requested = rows.length;
    const skipped = requested - assigned;
    return {
      assigned,
      requested,
      skipped,
    };
  }
}
