import { Module } from '@nestjs/common';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';
import { RolesRepository, RolesToPermissionsRepository } from './repositories';

@Module({
  controllers: [RolesController],
  providers: [RolesService, RolesRepository, RolesToPermissionsRepository],
  exports: [RolesService, RolesRepository, RolesToPermissionsRepository],
})
export class RolesModule {}
