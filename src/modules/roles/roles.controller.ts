import {
  Body,
  Controller,
  Get,
  Patch,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
import { AssignPermissionsDto } from './dto';
import { RolesService } from './roles.service';
import { AssignPermissionsResponse, FindAllResponse } from './interfaces';
import { Permissions } from 'src/common/decorators';
import { Action } from 'src/common/enum';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  @Permissions({ resource: 'roles', action: Action.READ })
  async findAllRoles(): Promise<FindAllResponse> {
    return this.rolesService.findAllRoles();
  }

  @Patch(':roleId/permissions')
  @Permissions({
    resource: 'roles',
    action: Action.ASSIGN_PERMISSIONS,
  })
  async assignPermissions(
    @Param('roleId', new ParseUUIDPipe()) roleId: string,
    @Body() dto: AssignPermissionsDto,
  ): Promise<AssignPermissionsResponse> {
    return this.rolesService.assignPermissions(roleId, dto);
  }
}
