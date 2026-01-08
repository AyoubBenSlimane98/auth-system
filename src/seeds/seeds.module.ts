import { Module } from '@nestjs/common';
import { PermissionsSeeder } from './permissions.seeder';
import { DATABASE_CONNECTION } from 'src/database/constants';
import { RolesSeeder } from './roles.seeder';

@Module({
  providers: [
    PermissionsSeeder,
    RolesSeeder,
    { provide: 'DB', useExisting: DATABASE_CONNECTION },
  ],
  exports: [PermissionsSeeder, RolesSeeder],
})
export class SeedsModule {}
