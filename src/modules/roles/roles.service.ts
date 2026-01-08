import { Injectable } from '@nestjs/common';
import { AssignPermissionsDto } from './dto';
import { RolesRepository } from './repositories/roles.repository';
import { AssignPermissionsResponse, FindAllResponse } from './interfaces';
import { RolesToPermissionsRepository } from './repositories';

@Injectable()
export class RolesService {
  constructor(
    private readonly rolesRepository: RolesRepository,
    private readonly rtpRespository: RolesToPermissionsRepository,
  ) {}
  async findAllRoles(): Promise<FindAllResponse> {
    const roles = await this.rolesRepository.findAll();
    return {
      status: true,
      message: roles.length
        ? 'Roles retrieved successfully'
        : 'No roles available',
      data: {
        roles,
      },
    };
  }

  async assignPermissions(
    roleId: string,
    dto: AssignPermissionsDto,
  ): Promise<AssignPermissionsResponse> {
    const result = await this.rtpRespository.create(roleId, dto);
    return {
      status: true,
      message: 'Permissions assigned successfully',
      data: result,
    };
  }
}
