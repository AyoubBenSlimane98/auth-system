import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { randomBytes } from 'crypto';
import { JwtPayload } from '../interfaces';

@Injectable()
export class JwtAuthService {
  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}
  private get Keys() {
    return {
      publicKey: this.config.getOrThrow<string>('jwt-key.publicKey'),
      privateKey: this.config.getOrThrow<string>('jwt-key.privateKey'),
    };
  }
  async generateAccessToken(user_id: string): Promise<string> {
    return await this.jwt.signAsync({
      sub: user_id,
    });
  }

  async generateTokens(user_id: string) {
    const access_token = await this.generateAccessToken(user_id);
    const refresh_token = randomBytes(64).toString('hex');
    return { access_token, refresh_token };
  }

  async verifyToken(token: string): Promise<JwtPayload> {
    try {
      const payload = await this.jwt.verifyAsync<JwtPayload>(token, {
        publicKey: this.Keys.publicKey,
        algorithms: ['RS256'],
      });
      return payload;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
