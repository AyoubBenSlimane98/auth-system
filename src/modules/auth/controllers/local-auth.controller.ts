import {
  Body,
  Controller,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { LocalAuthService } from '../services';
import {
  ConfirmPasswordDto,
  LoginDto,
  LogoutDto,
  RefreshDto,
  RegisterDto,
  ResetPasswordDto,
} from '../dtos';
import { Public, RateLimit, User } from 'src/common/decorators';
import { ApiResponse } from 'src/common/interfaces';
import {
  LoginResponse,
  LogoutResponse,
  RefreshResponse,
  RegisterResponse,
} from '../interfaces';
import { AuthRateLimitGuard } from 'src/common/guards';

@Controller('local-auth')
export class LocalAuthController {
  constructor(private readonly localAuthService: LocalAuthService) {}

  @Public()
  @RateLimit(10)
  @UseGuards(AuthRateLimitGuard)
  @Post('register')
  async register(@Body() dto: RegisterDto): Promise<RegisterResponse> {
    return this.localAuthService.register(dto);
  }

  @Public()
  @RateLimit({ limit: 3, ttl: 60 })
  @Post('login')
  @UseGuards(AuthRateLimitGuard)
  async login(@Body() dto: LoginDto): Promise<LoginResponse> {
    return this.localAuthService.login(dto);
  }

  @Post('logout')
  async logout(
    @User('sub', new ParseUUIDPipe()) sub: string,
    @Body() dto: LogoutDto,
  ): Promise<LogoutResponse> {
    return this.localAuthService.logout(sub, dto);
  }

  @Patch('refresh')
  async refresh(
    @User('sub', new ParseUUIDPipe()) sub: string,
    @Body() dto: RefreshDto,
  ): Promise<RefreshResponse> {
    return this.localAuthService.refresh(sub, dto);
  }

  @Public()
  @RateLimit({ limit: 2, ttl: 120 })
  @UseGuards(AuthRateLimitGuard)
  @Post('reset-password')
  async resetPassword(
    @Body() dto: ResetPasswordDto,
  ): Promise<ApiResponse<void>> {
    return this.localAuthService.resetPassword(dto);
  }

  @Public()
  @RateLimit({ limit: 2, ttl: 120 })
  @UseGuards(AuthRateLimitGuard)
  @Post('confirm-password')
  async confirmPassword(
    @Body() dto: ConfirmPasswordDto,
  ): Promise<ApiResponse<void>> {
    return this.localAuthService.confirmPassword(dto);
  }
}
