import { Module } from '@nestjs/common';
import { LocalAuthController, GoogleAuthController } from './controllers';
import {
  GoogleAuthService,
  LocalAuthService,
  JwtAuthService,
  ArgonService,
} from './services';

@Module({
  controllers: [LocalAuthController, GoogleAuthController],
  providers: [
    GoogleAuthService,
    LocalAuthService,
    JwtAuthService,
    ArgonService,
  ],
})
export class AuthModule {}
