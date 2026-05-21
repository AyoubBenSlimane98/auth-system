import { Module } from '@nestjs/common';
import { TokensRepository } from '@modules/tokens/repository/tokens.repository';

@Module({
  providers: [TokensRepository],
  exports: [TokensRepository],
})
export class TokensModule {}
