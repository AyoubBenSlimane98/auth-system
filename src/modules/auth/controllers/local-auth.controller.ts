import { Body, Controller, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { LocalAuthService } from '../services';
import {
  ConfirmPasswordDto,
  LoginDto,
  LogoutDto,
  RefreshDto,
  RegisterDto,
  ResetPasswordDto,
} from '../dtos';
import { Public, User } from 'src/common/decorators';
import { ApiResponse } from 'src/common/interfaces';
import {
  LoginResponse,
  LogoutResponse,
  RefreshResponse,
  RegisterResponse,
} from '../interfaces';

@Controller('local-auth')
export class LocalAuthController {
  constructor(private readonly localAuthService: LocalAuthService) {}

  @Public()
  @Post('register')
  async register(
    @Body() dto: RegisterDto,
  ): Promise<ApiResponse<RegisterResponse>> {
    return this.localAuthService.register(dto);
  }

  @Public()
  @Post('login')
  async login(@Body() dto: LoginDto): Promise<ApiResponse<LoginResponse>> {
    return this.localAuthService.login(dto);
  }

  @Post('logout')
  async logout(
    @User('sub', new ParseUUIDPipe()) sub: string,
    dto: LogoutDto,
  ): Promise<ApiResponse<LogoutResponse>> {
    return this.localAuthService.logout(sub, dto);
  }

  @Patch('refresh')
  async refresh(
    @User('sub', new ParseUUIDPipe()) sub: string,
    dto: RefreshDto,
  ): Promise<ApiResponse<RefreshResponse>> {
    return this.localAuthService.refresh(sub, dto);
  }

  @Public()
  @Post('reset-password')
  async resetPassword(
    @Body() dto: ResetPasswordDto,
  ): Promise<ApiResponse<void>> {
    return this.localAuthService.resetPassword(dto);
  }

  @Public()
  @Post('confirm-password')
  async confirmPassword(
    @Body() dto: ConfirmPasswordDto,
  ): Promise<ApiResponse<void>> {
    return this.localAuthService.confirmPassword(dto);
  }
}
