import { Module } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { JwtType } from '../../configuration/types';
import { JwtAuthService } from './services/jwt-auth.service';
import { ProvidersModule } from '../providers/providers.module';
import { SessionsModule } from '../sessions/sessions.module';
import { UsersModule } from '../users/users.module';
import { TokensModule } from '../tokens/tokens.module';
import { GoogleStrategy, JwtAuthStrategy, TwitterStrategy } from './strategies';
import { SendGridService } from './services/sendgrid.service';
import { Argon2Service } from './services/argon2.service';
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
    SendGridService,
    Argon2Service,
    GoogleStrategy,
    TwitterStrategy,
  ],
})
export class AuthModule {}
