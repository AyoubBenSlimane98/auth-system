import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ConfirmPasswordDto,
  LoginDto,
  LogoutDto,
  RefreshDto,
  RegisterDto,
  ResetPasswordDto,
} from '../dtos';
import { UsersRepository } from 'src/modules/users/repositories';
import { ArgonService } from './argon.service';
import { JwtAuthService } from './jwt-auth.service';
import {
  PasswordResetTokensRepository,
  RefreshTokensRepository,
} from 'src/modules/refresh-tokens/repositories';
import { ApiResponse } from 'src/common/interfaces';
import {
  LoginResponse,
  RegisterResponse,
  LogoutResponse,
  RefreshResponse,
} from '../interfaces';
import { randomBytes } from 'crypto';
import { SgMailService } from './sgMail.service';
import { RefreshTokensService } from 'src/modules/refresh-tokens/refresh-tokens.service';

@Injectable()
export class LocalAuthService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly refreshTokensService: RefreshTokensService,
    private readonly rtRepository: RefreshTokensRepository,
    private readonly passwordRtRepository: PasswordResetTokensRepository,
    private readonly argonService: ArgonService,
    private readonly jwtAuthService: JwtAuthService,
    private readonly sgmailService: SgMailService,
  ) {}
  async register(dto: RegisterDto): Promise<ApiResponse<RegisterResponse>> {
    const existUser = await this.usersRepository.emailExists(dto.email);

    if (existUser) {
      throw new ConflictException({ message: 'Email already registered' });
    }

    const newUser = await this.createUserWithProfile(dto);

    const tokens = await this.jwtAuthService.generateTokens(newUser.user_id);

    const tokenRecord = await this.refreshTokensService.storeRefreshToken(
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

    const tokenRecord = await this.refreshTokensService.storeRefreshToken(
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

  async refresh(
    sub: string,
    dto: RefreshDto,
  ): Promise<ApiResponse<RefreshResponse>> {
    const token = await this.rtRepository.findValidToken(sub, dto.token_id);
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

    const access_token = await this.jwtAuthService.generateAccessToken(sub);

    return {
      status: true,
      message: 'Refresh token successfully',
      data: {
        user_id: sub,
        access_token,
      },
    };
  }

  async resetPassword(dto: ResetPasswordDto): Promise<ApiResponse<void>> {
    const user = await this.usersRepository.findUserByEmail(dto.email);
    if (!user) {
      return {
        status: true,
        message: 'If the email exists, a reset link has been sent',
      };
    }
    const token = this.generatePasswordResetToken();
    const hashToken = await this.argonService.hashData(token);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await this.passwordRtRepository.saveTokenPassword(
      user.user_id,
      hashToken,
      expiresAt,
    );
    await this.sgmailService.sendEmailToken(token, dto.email);
    return {
      status: true,
      message: 'If the email exists, a reset link has been sent',
    };
  }

  async confirmPassword(dto: ConfirmPasswordDto): Promise<ApiResponse<void>> {
    const tokens = await this.passwordRtRepository.findValidTokens();
    let matchedToken: (typeof tokens)[0] | null = null;

    for (const record of tokens) {
      const isMatched = await this.argonService.verifyData(
        record.token,
        dto.token,
      );
      if (isMatched) {
        matchedToken = record;
        break;
      }
    }
    if (!matchedToken) {
      throw new BadRequestException('Invalid or expired token');
    }

    const hashPassword = await this.argonService.hashData(dto.new_password);
    await this.usersRepository.changePasswordUser(
      matchedToken.user_id,
      hashPassword,
    );
    await this.passwordRtRepository.markAsUsed(matchedToken.id);
    return {
      status: true,
      message: 'Password reset successfully',
    };
  }

  private async createUserWithProfile(dto: RegisterDto) {
    const { password, ...rest } = dto;
    const hashPassword = await this.argonService.hashData(password);

    const user = await this.usersRepository.createUser({
      password: hashPassword,
      ...rest,
    });
    return user;
  }

  private generatePasswordResetToken(): string {
    return randomBytes(32).toString('hex');
  }
}
