import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersRepository } from 'src/modules/users/repositories';
import { GoogleUserInput } from '../interfaces';
import { JwtAuthService } from './jwt-auth.service';
import { RefreshTokensService } from 'src/modules/refresh-tokens/refresh-tokens.service';

@Injectable()
export class GoogleAuthService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly jwtAuthService: JwtAuthService,
    private readonly refreshTokensService: RefreshTokensService,
  ) {}

  async CreateGoogleUser(data: GoogleUserInput) {
    const user = await this.usersRepository.createGoogleUser(data);
    if (!user) {
      throw new UnauthorizedException({ message: 'User creation failed' });
    }
    const tokens = await this.jwtAuthService.generateTokens(user.user_id);

    const tokenRecord = await this.refreshTokensService.storeRefreshToken(
      user.user_id,
      tokens.refresh_token,
    );
    return { token_id: tokenRecord.token_id, ...tokens };
  }
}
