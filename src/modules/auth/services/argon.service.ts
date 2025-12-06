import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';
import { ARGON2_OPTIONS } from '../constants';

@Injectable()
export class ArgonService {
  constructor(private config: ConfigService) {}
  async hashData(data: string): Promise<string> {
    return await argon2.hash(data, {
      ...ARGON2_OPTIONS,
      secret: Buffer.from(this.config.getOrThrow<string>('argon.secret')),
    });
  }
  async verifyData(hash: string, data: string): Promise<boolean> {
    return await argon2.verify(hash, data, {
      secret: Buffer.from(this.config.getOrThrow<string>('argon.secret')),
    });
  }
}
