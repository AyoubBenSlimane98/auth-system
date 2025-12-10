import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginDto, LogoutDto, RegisterDto } from '../dtos';
import { UsersRepository } from 'src/modules/users/repositories';
import { ArgonService } from './argon.service';
import { JwtAuthService } from './jwt-auth.service';
import { RefreshTokensRepository } from 'src/modules/refresh-tokens/repositories';
import { ApiResponse } from 'src/common/interfaces';
import { LoginResponse, RegisterResponse, LogoutResponse } from '../interfaces';

@Injectable()
export class LocalAuthService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly rtRepository: RefreshTokensRepository,
    private readonly argonService: ArgonService,
    private readonly jwtAuthService: JwtAuthService,
  ) {}
  async register(dto: RegisterDto): Promise<ApiResponse<RegisterResponse>> {
    const existUser = await this.usersRepository.emailExists(dto.email);

    if (existUser) {
      throw new ConflictException({ message: 'Email already registered' });
    }

    const newUser = await this.createUserWithProfile(dto);

    const tokens = await this.jwtAuthService.generateTokens(newUser.user_id);

    const tokenRecord = await this.storeRefreshToken(
      newUser.user_id,
      tokens.refresh_token,
    );

    return {
      status: true,
      message: 'Created new user successfully',
      data: {
        user: {
          user_id: newUser.user_id,
          full_name: newUser.profile.full_name,
        },
        tokens: {
          token_id: tokenRecord.token_id,
          ...tokens,
        },
      },
    };
  }

  async login(dto: LoginDto): Promise<ApiResponse<LoginResponse>> {
    const user = await this.usersRepository.findUserByEmail(dto.email);
    if (!user || !user.password)
      throw new UnauthorizedException({
        message: 'Email or password is incorect',
      });
    const isPasswordValid = await this.argonService.verifyData(
      user.password,
      dto.password,
    );
    if (!isPasswordValid)
      throw new UnauthorizedException({
        message: 'Email or password is incorect',
      });
    const tokens = await this.jwtAuthService.generateTokens(user.user_id);

    const tokenRecord = await this.storeRefreshToken(
      user.user_id,
      tokens.refresh_token,
    );

    return {
      status: true,
      message: 'Login successfully',
      data: {
        user_id: user.user_id,
        tokens: {
          token_id: tokenRecord.token_id,
          ...tokens,
        },
      },
    };
  }

  async logout(
    sub: string,
    dto: LogoutDto,
  ): Promise<ApiResponse<LogoutResponse>> {
    const token = await this.rtRepository.findTokenById(dto.token_id, sub);
    if (!token || !token.hash_token) {
      throw new UnauthorizedException({
        message: 'Invalid token',
      });
    }

    const isTokenMatched = await this.argonService.verifyData(
      token.hash_token,
      dto.refresh_token,
    );
    if (!isTokenMatched) {
      throw new UnauthorizedException({
        message: 'Invalid token',
      });
    }
    await this.rtRepository.deleteTokenById(dto.token_id);
    return {
      status: true,
      message: 'Logout  successfully',
      data: {
        user_id: sub,
        token_id: dto.token_id,
      },
    };
  }

  async refresh() {}

  async resetPassword() {}

  async confirmPassword() {}

  private async createUserWithProfile(dto: RegisterDto) {
    const { password, ...rest } = dto;
    const hashPassword = await this.argonService.hashData(password);

    const user = await this.usersRepository.createUser({
      password: hashPassword,
      ...rest,
    });
    return user;
  }
  private async storeRefreshToken(user_id: string, refreshToken: string) {
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
