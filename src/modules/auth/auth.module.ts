import { forwardRef, Module } from '@nestjs/common';
import { LocalAuthController, GoogleAuthController } from './controllers';
import {
  GoogleAuthService,
  LocalAuthService,
  JwtAuthService,
  ArgonService,
  SgMailService,
} from './services';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JWT_EXPIRES_IN, JWT_PROPERTY, JWT_STRATEGY } from './constants';
import { GoogleStrategy, JwtStrategy } from './strategies';
import { UsersModule } from '../users/users.module';
import { RefreshTokensModule } from '../refresh-tokens/refresh-tokens.module';
import { AuthProvidersRepository } from './repositories';

@Module({
  imports: [
    PassportModule.register({
      defaultStrategy: JWT_STRATEGY,
      property: JWT_PROPERTY,
      session: false,
    }),
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        publicKey: config.getOrThrow<string>('jwt-key.publicKey'),
        privateKey: config.getOrThrow<string>('jwt-key.privateKey'),
        signOptions: { algorithm: 'RS256', expiresIn: JWT_EXPIRES_IN },
        verifyOptions: { algorithms: ['RS256'] },
      }),
    }),
    UsersModule,
    RefreshTokensModule,
    forwardRef(() => UsersModule),
    forwardRef(() => RefreshTokensModule),
  ],
  controllers: [LocalAuthController, GoogleAuthController],
  providers: [
    GoogleAuthService,
    LocalAuthService,
    JwtAuthService,
    ArgonService,
    GoogleStrategy,
    JwtStrategy,
    SgMailService,
    AuthProvidersRepository,
  ],
  exports: [ArgonService, AuthProvidersRepository],
})
export class AuthModule {}
