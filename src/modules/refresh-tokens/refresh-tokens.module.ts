import { Module } from '@nestjs/common';
import { RefreshTokensController } from './refresh-tokens.controller';
import { RefreshTokensService } from './refresh-tokens.service';
import { RefreshTokensRepository } from './repositories';

@Module({
  controllers: [RefreshTokensController],
  providers: [RefreshTokensService, RefreshTokensRepository],
  exports: [RefreshTokensService, RefreshTokensRepository],
})
export class RefreshTokensModule {}
