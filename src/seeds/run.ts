import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { RolesSeeder } from './roles.seeder';
import { PermissionsSeeder } from './permissions.seeder';

async function run() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const rolesSeeder = app.get(RolesSeeder);
  const permissionsSeeder = app.get(PermissionsSeeder);

  await Promise.all([rolesSeeder.seed(), permissionsSeeder.seed()]);
  await app.close();
}
void run();
