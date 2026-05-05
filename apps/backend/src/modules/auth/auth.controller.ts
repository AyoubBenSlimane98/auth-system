import { Body, Controller, Post, Query, Req, Res } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { ConfigService } from '@nestjs/config';
import { Public } from '../../common/decorators';
import { LocalSignInDto, LocalSignUpDto, ResetPasswordDto } from './dtos';
import type { Request, Response } from 'express';
import { CookieUtil } from './utils';
import type { AuthRequest, JwtCookies } from '../../common/types';
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly config: ConfigService,
  ) {}

  @Public()
  @Post('signin')
  async localSignIn(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Body() body: LocalSignInDto,
  ) {
    const userAgent = req.headers['user-agent'] || 'unknown-device';
    const ip = req.ip || req.socket.remoteAddress || 'unknown-ip';
    const result = await this.authService.localSignIn(body, userAgent, ip);
    CookieUtil.setAuthCookies(res, result.data.cookies);
    return {
      message: result.message,
      data: {
        user_id: result.data.user_id,
        provider_id: result.data.provider_id,
      },
    };
  }

  @Public()
  @Post('signup')
  async localSignUp(@Body() body: LocalSignUpDto) {
    return this.authService.localSignUp(body);
  }

  @Public()
  @Post('verify-email')
  async verificationEmail(@Query('token') token: string) {
    return this.authService.verificationEmail(token);
  }

  @Public()
  @Post('resend-verification')
  async resendVerification(@Body() body: { email: string }) {
    return this.authService.resendVerification(body);
  }

  @Post('logout')
  async logOut(
    @Req() req: AuthRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { refresh_token, session_id }: JwtCookies = req.cookies;
    const result = await this.authService.logOut(session_id, refresh_token);
    CookieUtil.clearAuthCookies(res);
    return result;
  }

  @Post('refresh')
  async refresh(
    @Req() req: AuthRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { refresh_token, session_id }: JwtCookies = req.cookies;
    const result = await this.authService.refresh(session_id, refresh_token);
    CookieUtil.setAuthCookies(res, result.data);
    return { message: result.message };
  }

  @Public()
  @Post('forgot-password')
  async fogotPassword(@Body() body: { email: string }) {
    return this.authService.fogotPassword(body);
  }

  @Public()
  @Post('reset-password')
  async resetPassword(@Body() body: ResetPasswordDto) {
    return this.authService.resetPassword(body);
  }
}
