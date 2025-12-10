import { Body, Controller, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { LocalAuthService } from '../services';
import { LoginDto, LogoutDto, RegisterDto } from '../dtos';
import { Public, User } from 'src/common/decorators';
import { ApiResponse } from 'src/common/interfaces';
import { LoginResponse, LogoutResponse, RegisterResponse } from '../interfaces';

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
  async refresh() {
    return this.localAuthService.refresh();
  }

  @Public()
  @Post('reset-password')
  async resetPassword() {
    return this.localAuthService.resetPassword();
  }

  @Public()
  @Post('confirm-password')
  async confirmPassword() {
    return this.localAuthService.confirmPassword();
  }
}
