import { Inject, Injectable } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../../database/schema';
import { DATABASE_CONNECTION } from 'src/database/constants';
import { RolesRepository } from './roles.repository';
import { AssignPermissionsDto } from '../dto';
import { eq, sql } from 'drizzle-orm';

@Injectable()
export class RolesToPermissionsRepository {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: NodePgDatabase<typeof schema>,
    private readonly rolesRepository: RolesRepository,
  ) {}

  async create(roleId: string, dto: AssignPermissionsDto) {
    await this.rolesRepository.findOneById(roleId);
    const rows = dto.permissions.map((permissionId) => ({
      role_id: roleId,
      permission_id: permissionId,
    }));

    const result = await this.db
      .insert(schema.rolesToPermissions)
      .values(rows)
      .onConflictDoNothing();
    const assigned = result.rowCount ?? 0;
    const requested = rows.length;
    const skipped = requested - assigned;
    return {
      assigned,
      requested,
      skipped,
    };
  }
  async findUserPermissions(userId: string) {
    const result = await this.db
      .select({
        permission: sql<string>`${
          schema.permissions.resource
        } || '.' || ${schema.permissions.action}`,
      })
      .from(schema.usersToRoles)
      .innerJoin(
        schema.roles,
        eq(schema.roles.role_id, schema.usersToRoles.role_id),
      )
      .innerJoin(
        schema.rolesToPermissions,
        eq(schema.rolesToPermissions.role_id, schema.usersToRoles.role_id),
      )
      .innerJoin(
        schema.permissions,
        eq(
          schema.permissions.permission_id,
          schema.rolesToPermissions.permission_id,
        ),
      )
      .where(eq(schema.usersToRoles.user_id, userId));

    return result;
  }
}
