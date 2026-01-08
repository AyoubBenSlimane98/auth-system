import { Body, Controller, Param, ParseUUIDPipe, Patch } from '@nestjs/common';
import { AssignRolesDto } from './dto';
import { UsersService } from './users.service';
import { AssignRolesResponse } from './interfaces';
import { Permissions } from 'src/common/decorators';
import { Action } from 'src/common/enum';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Patch(':userId/roles')
  @Permissions({ resource: 'users', action: Action.ASSIGN_ROLES })
  async assignUserRoles(
    @Param('userId', new ParseUUIDPipe()) userId: string,
    @Body() dto: AssignRolesDto,
  ): Promise<AssignRolesResponse> {
    return this.usersService.assignUserRoles(userId, dto);
  }
}
