import { Controller, Get } from '@nestjs/common';
import { UsersService } from '@modules/users/users.service';
import { RateLimit, User } from '@common/decorators';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @RateLimit({ limit: 30, ttl: 60 })
  @Get('me')
  async getUserProfile(@User('sub') sub: string) {
    return this.usersService.getUserProfile(sub);
  }
}
