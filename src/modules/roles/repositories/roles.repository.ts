import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../../database/schema';
import { DATABASE_CONNECTION } from 'src/database/constants';
import { eq } from 'drizzle-orm';
import { Roles } from 'src/common/enum';

@Injectable()
export class RolesRepository {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async findOneById(roleId: string) {
    const [role] = await this.db
      .select({
        role_id: schema.roles.role_id,
        name: schema.roles.name,
        description: schema.roles.description,
      })
      .from(schema.roles)
      .where(eq(schema.roles.role_id, roleId));
    if (!role) {
      throw new NotFoundException({
        message: `Role with id ${roleId} not found`,
      });
    }
    return role;
  }

  async findOneByName(name: Roles) {
    const [role] = await this.db
      .select({
        role_id: schema.roles.role_id,
      })
      .from(schema.roles)
      .where(eq(schema.roles.name, name));
    if (!role) {
      throw new NotFoundException({
        message: `Role with " ${name}" not found`,
      });
    }
    return role;
  }

  async findAll() {
    return await this.db
      .select({
        role_id: schema.roles.role_id,
        name: schema.roles.name,
        description: schema.roles.description,
      })
      .from(schema.roles);
  }
}
