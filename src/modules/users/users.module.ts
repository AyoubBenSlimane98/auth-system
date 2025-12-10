import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UsersRepository, UsersRolesRepository } from './repositories';
import { ProfilesModule } from '../profiles/profiles.module';

@Module({
  imports: [ProfilesModule],
  controllers: [UsersController],
  providers: [UsersService, UsersRepository, UsersRolesRepository],
  exports: [UsersService, UsersRepository, UsersRolesRepository],
})
export class UsersModule {}
