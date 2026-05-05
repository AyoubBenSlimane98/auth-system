import { Module } from '@nestjs/common';
import { ProvidersRepository } from './repository/providers.repository';

@Module({
  providers: [ProvidersRepository],
  exports: [ProvidersRepository],
})
export class ProvidersModule {}
