import { Module } from '@nestjs/common';
import { ProvidersRepository } from '@modules/providers/repository/providers.repository';

@Module({
  providers: [ProvidersRepository],
  exports: [ProvidersRepository],
})
export class ProvidersModule {}
