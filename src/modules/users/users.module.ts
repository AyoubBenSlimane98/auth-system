import { forwardRef, Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UsersRepository, UsersRolesRepository } from './repositories';
import { ProfilesModule } from '../profiles/profiles.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [ProfilesModule, forwardRef(() => AuthModule)],
  controllers: [UsersController],
  providers: [UsersService, UsersRepository, UsersRolesRepository],
  exports: [UsersService, UsersRepository, UsersRolesRepository],
})
export class UsersModule {}
