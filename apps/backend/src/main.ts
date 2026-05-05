import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const prot = Number(process.env.APP_PORT) || 3002;
  await app.listen(prot, '0.0.0.0');
}
void bootstrap();
