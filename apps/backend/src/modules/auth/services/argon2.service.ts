import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';
import { Argon2Type } from '@configuration/types';

@Injectable()
export class Argon2Service {
  constructor(private readonly config: ConfigService) {}
  private getSecret(): Buffer {
    const secret = this.config.getOrThrow<Argon2Type>('argon2').secret;
    if (!secret) {
      throw new Error('Missing ARGON2_SECRET');
    }
    return Buffer.from(secret);
  }
  async hashData(data: string): Promise<string> {
    return await argon2.hash(data, {
      type: argon2.argon2id,
      timeCost: 3,
      memoryCost: 2 ** 16,
      parallelism: 1,
      hashLength: 32,
      secret: this.getSecret(),
    });
  }
  async verifyData(hash: string, data: string): Promise<boolean> {
    return await argon2.verify(hash, data, {
      secret: this.getSecret(),
    });
  }
}
