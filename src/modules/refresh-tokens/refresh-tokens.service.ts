import { Injectable } from '@nestjs/common';
import { ArgonService } from '../auth/services';
import { RefreshTokensRepository } from './repositories';

@Injectable()
export class RefreshTokensService {
  constructor(
    private readonly argonService: ArgonService,
    private readonly rtRepository: RefreshTokensRepository,
  ) {}
  async storeRefreshToken(user_id: string, refreshToken: string) {
    const hashedToken = await this.argonService.hashData(refreshToken);
    const expires_at = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const token = await this.rtRepository.storeToken({
      user_id,
      token: hashedToken,
      expires_at,
    });
    return token;
  }
}
