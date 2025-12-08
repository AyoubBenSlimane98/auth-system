import { Controller, Patch, Post } from '@nestjs/common';
import { LocalAuthService } from '../services';

@Controller('local-auth')
export class LocalAuthController {
  constructor(private readonly localAuthService: LocalAuthService) {}

  @Post('register')
  async register() {
    return this.localAuthService.register();
  }

  @Post('login')
  async login() {
    return this.localAuthService.login();
  }

  @Post('logout')
  async logout() {
    return this.localAuthService.logout();
  }

  @Patch('refresh')
  async refresh() {
    return this.localAuthService.refresh();
  }

  @Post('reset-password')
  async resetPassword() {
    return this.localAuthService.resetPassword();
  }

  @Post('confirm-password')
  async confirmPassword() {
    return this.localAuthService.confirmPassword();
  }
}
