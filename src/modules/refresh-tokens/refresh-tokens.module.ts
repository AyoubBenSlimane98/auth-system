import { forwardRef, Module } from '@nestjs/common';
import { RefreshTokensController } from './refresh-tokens.controller';
import { RefreshTokensService } from './refresh-tokens.service';
import {
  PasswordResetTokensRepository,
  RefreshTokensRepository,
} from './repositories';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [forwardRef(() => AuthModule)],
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
