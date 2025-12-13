import { Module } from '@nestjs/common';
import { RefreshTokensController } from './refresh-tokens.controller';
import { RefreshTokensService } from './refresh-tokens.service';
import {
  PasswordResetTokensRepository,
  RefreshTokensRepository,
} from './repositories';

@Module({
  controllers: [RefreshTokensController],
  providers: [
    RefreshTokensService,
    RefreshTokensRepository,
    PasswordResetTokensRepository,
  ],
  exports: [
    RefreshTokensService,
    RefreshTokensRepository,
    PasswordResetTokensRepository,
  ],
})
export class RefreshTokensModule {}
