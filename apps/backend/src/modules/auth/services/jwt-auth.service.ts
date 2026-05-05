import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JsonWebTokenError, JwtService, TokenExpiredError } from '@nestjs/jwt';
import { randomBytes, randomUUID } from 'crypto';
import { JwtType } from '../../../configuration/types';
import { ErrorCode, JwtPayloadTypes } from '../../../common/enums';
import { AppException } from '../../../common/filters';
import {
  JwtAuthPayload,
  JwtEmailPayload,
  JwtResetPayload,
} from '../../../common/types';

export interface JwtKeyMap {
  auth: JwtAuthPayload;
  email: JwtEmailPayload;
  reset: JwtResetPayload;
}

@Injectable()
export class JwtAuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async generateVerifyEmailToken(provider_id: string) {
    const jwt = this.config.getOrThrow<JwtType>('jwt');
    const jti = randomUUID();
    return this.jwtService.signAsync(
      { sub: provider_id, type: 'verify_email', jti },
      {
        privateKey: jwt.email.privateKey,
        expiresIn: jwt.email.expiresIn,
      },
    );
  }
  async generateResetPasswordToken(provider_id: string) {
    const jwt = this.config.getOrThrow<JwtType>('jwt');
    const jti = randomUUID();
    return this.jwtService.signAsync(
      { sub: provider_id, type: 'reset_password', jti },
      {
        privateKey: jwt.reset.privateKey,
        expiresIn: jwt.reset.expiresIn,
      },
    );
  }
  async generateAccessToken(provider_id: string, session_id: string) {
    const jwt = this.config.getOrThrow<JwtType>('jwt');
    const jti = randomUUID();
    return this.jwtService.signAsync(
      { sub: provider_id, session_id, type: 'access', jti },
      {
        privateKey: jwt.auth.privateKey,
        expiresIn: jwt.auth.access_token_ttl,
      },
    );
  }
  generateRefreshToken() {
    return randomBytes(64).toString('hex');
  }

  async generateTokens(provider_id: string, session_id: string) {
    const accessTokenPromise = this.generateAccessToken(
      provider_id,
      session_id,
    );

    const refreshTokenPromise = Promise.resolve(this.generateRefreshToken());

    const [access_token, refresh_token] = await Promise.all([
      accessTokenPromise,
      refreshTokenPromise,
    ]);

    return { access_token, refresh_token };
  }

  async verifyAccessToken(token: string) {
    return await this.verifyToken(token, 'auth', JwtPayloadTypes.ACCESS);
  }
  async verifyEmailToken(token: string) {
    return await this.verifyToken(token, 'email', JwtPayloadTypes.VERIFY_EMAIL);
  }
  async verifyResetPassordToken(token: string) {
    return await this.verifyToken(
      token,
      'reset',
      JwtPayloadTypes.RESET_PASSWORD,
    );
  }
  private async verifyToken<K extends keyof JwtKeyMap>(
    token: string,
    key: K,
    expectedType: JwtPayloadTypes,
  ): Promise<JwtKeyMap[K]> {
    const jwt = this.config.getOrThrow<JwtType>('jwt');

    try {
      const payload = await this.jwtService.verifyAsync<JwtKeyMap[K]>(token, {
        algorithms: ['RS256'],
        publicKey: jwt[key].publicKey,
      });
      if (payload.type !== expectedType) {
        throw new AppException({
          message: 'Invalid token type',
          code: ErrorCode.TOKEN_TYPE_INVALID,
          statusCode: HttpStatus.FORBIDDEN,
        });
      }
      return payload;
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new AppException({
          message: 'Token has expired',
          code: ErrorCode.TOKEN_EXPIRED,
          statusCode: HttpStatus.UNAUTHORIZED,
        });
      }

      if (error instanceof JsonWebTokenError) {
        throw new AppException({
          message: 'Invalid token',
          code: ErrorCode.TOKEN_INVALID,
          statusCode: HttpStatus.UNAUTHORIZED,
        });
      }

      throw new AppException({
        message: 'Authentication failed',
        code: ErrorCode.TOKEN_INVALID,
        statusCode: HttpStatus.UNAUTHORIZED,
      });
    }
  }
}
