import { Controller, Get } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from '../../common/decorators';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @Get('me')
  async getUserProfile(@User('sub') sub: string) {
    return this.usersService.getUserProfile(sub);
  }
}
