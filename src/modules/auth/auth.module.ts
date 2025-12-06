import { Module } from '@nestjs/common';
import { LocalAuthController, GoogleAuthController } from './controllers';
import {
  GoogleAuthService,
  LocalAuthService,
  JwtAuthService,
  ArgonService,
} from './services';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        publicKey: config.getOrThrow<string>('jwt-key.publicKey'),
        privateKey: config.getOrThrow<string>('jwt-key.privateKey'),
        verifyOptions: { algorithms: ['RS256'] },
      }),
    }),
  ],
  controllers: [LocalAuthController, GoogleAuthController],
  providers: [
    GoogleAuthService,
    LocalAuthService,
    JwtAuthService,
    ArgonService,
  ],
})
export class AuthModule {}
