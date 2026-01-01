import { Injectable } from '@nestjs/common';
import { AssignRolesDto } from './dto';
import { UsersRolesRepository } from './repositories';
import { AssignRolesResponse } from './interfaces';

@Injectable()
export class UsersService {
  constructor(private readonly urRespository: UsersRolesRepository) {}
  async assignUserRoles(
    userId: string,
    dto: AssignRolesDto,
  ): Promise<AssignRolesResponse> {
    const result = await this.urRespository.assign(userId, dto);
    return {
      status: true,
      message: 'Roles assigned successfully',
      data: result,
    };
  }
}
