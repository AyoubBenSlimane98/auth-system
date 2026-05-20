import { Module } from '@nestjs/common';
import { UsersService } from '@modules/users/users.service';
import { UsersController } from '@modules/users/users.controller';
import { UsersRepository } from '@modules/users/repository/users.repository';
import { ProvidersModule } from '@modules/providers/providers.module';

@Module({
  imports: [ProvidersModule],
  controllers: [UsersController],
  providers: [UsersService, UsersRepository],
  exports: [UsersService, UsersRepository],
})
export class UsersModule {}
