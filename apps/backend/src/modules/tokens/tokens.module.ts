import { Module } from '@nestjs/common';
import { TokensRepository } from './repository/tokens.repository';

@Module({
  providers: [TokensRepository],
  exports: [TokensRepository],
})
export class TokensModule {}
