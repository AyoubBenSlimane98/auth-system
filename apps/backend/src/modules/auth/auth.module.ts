import { Module } from '@nestjs/common';
import { AuthService } from '@modules/auth/services/auth.service';
import { AuthController } from '@modules/auth/auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { JwtType } from '@configuration/types';
import { JwtAuthService } from '@modules/auth/services/jwt-auth.service';
import { ProvidersModule } from '@modules/providers/providers.module';
import { SessionsModule } from '@modules/sessions/sessions.module';
import { UsersModule } from '@modules/users/users.module';
import { TokensModule } from '@modules/tokens/tokens.module';
import {
  GoogleStrategy,
  JwtAuthStrategy,
  TwitterStrategy,
} from '@modules/auth/strategies';
import { Argon2Service } from '@modules/auth/services/argon2.service';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
    PassportModule.register({ session: false, property: 'user' }),
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const jwt = config.getOrThrow<JwtType>('jwt');
        return {
          privateKey: jwt.auth.privateKey,
          publicKey: jwt.auth.publicKey,
          signOptions: { algorithm: 'RS256' },
          verifyOptions: { algorithms: ['RS256'] },
        };
      },
    }),
    ProvidersModule,
    SessionsModule,
    UsersModule,
    TokensModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtAuthService,
    JwtAuthStrategy,
    Argon2Service,
    GoogleStrategy,
    TwitterStrategy,
  ],
})
export class AuthModule {}
