import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { ConfigService } from '@nestjs/config';
import { Public, RateLimit } from '@common/decorators';
import {
  GoogleDto,
  LocalSignInDto,
  LocalSignUpDto,
  ResetPasswordDto,
  TwitterDto,
} from '@modules/auth/dtos';
import type { Request, Response } from 'express';
import { CookieUtil } from '@modules/auth/utils';
import type { AuthRequest, JwtCookies } from '@common/types';
import { GoogleGuard, TwitterGuard } from '@modules/auth/guards';
import { AppType } from '@configuration/types';
import { LoggerService } from '@infrastructure/logs/logger.service';

@Controller('auth')
export class AuthController {
  private readonly context = AuthController.name;
  constructor(
    private readonly authService: AuthService,
    private readonly config: ConfigService,
    private readonly logger: LoggerService,
  ) {}

  @Public()
  @RateLimit({ limit: 20, ttl: 60 })
  @UseGuards(GoogleGuard)
  @Get('google')
  async googleAuth() {}

  @Public()
  @RateLimit({ limit: 20, ttl: 60 })
  @UseGuards(TwitterGuard)
  @Get('twitter')
  async twitterAuth() {}

  @Public()
  @RateLimit({ limit: 10, ttl: 60 })
  @UseGuards(GoogleGuard)
  @Get('google/callback')
  async googleAuthRedirect(@Req() req: Request, @Res() res: Response) {
    const data = await this.socialAuthRedirect(req);
    this.logger.log(this.context, 'google callback', {
      ip: data.ip,
    });
    return await this.authService.googleAuthRedirect(data, res);
  }

  @Public()
  @RateLimit({ limit: 10, ttl: 60 })
  @UseGuards(TwitterGuard)
  @Get('twitter/callback')
  async twitterAuthRedirect(@Req() req: Request, @Res() res: Response) {
    const data = await this.socialAuthRedirect(req);
    this.logger.log(this.context, 'twitter callback', {
      ip: data.ip,
    });
    return await this.authService.twitterAuthRedirect(data, res);
  }

  @Public()
  @RateLimit({ limit: 3, ttl: 300 })
  @Post('signup')
  async localSignUp(@Body() body: LocalSignUpDto) {
    this.logger.log(this.context, 'signup attempt', { email: body.email });
    const result = await this.authService.localSignUp(body);
    this.logger.log(this.context, 'signup success', {
      userId: result.data.user_id,
      providerId: result.data.provider_id,
    });
    return result;
  }

  @Public()
  @RateLimit({ limit: 5, ttl: 60 })
  @Post('signin')
  async localSignIn(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Body() body: LocalSignInDto,
  ) {
    const userAgent = req.headers['user-agent'] || 'unknown-device';
    const ip = req.ip || req.socket.remoteAddress || 'unknown-ip';
    this.logger.log(this.context, 'signin attempt', {
      email: body.email,
      ip,
    });
    const result = await this.authService.localSignIn(body, userAgent, ip);
    CookieUtil.setAuthCookies(res, result.data.cookies);
    this.logger.log(this.context, 'signin success', {
      userId: result.data.user_id,
      providerId: result.data.provider_id,
    });
    return {
      message: result.message,
      data: {
        user_id: result.data.user_id,
        provider_id: result.data.provider_id,
      },
    };
  }

  @Public()
  @RateLimit({ limit: 5, ttl: 300 })
  @Post('verify-email')
  async verificationEmail(@Query('token') token: string) {
    return this.authService.verificationEmail(token);
  }

  @Public()
  @RateLimit({ limit: 2, ttl: 300 })
  @Post('resend-verification')
  async resendVerification(@Body() body: { email: string }) {
    return this.authService.resendVerification(body);
  }

  @RateLimit({ limit: 20, ttl: 60 })
  @Post('logout')
  async logOut(
    @Req() req: AuthRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { refresh_token, session_id }: JwtCookies = req.cookies;
    this.logger.log(this.context, 'logout attempt', {
      sessionId: session_id,
    });
    const result = await this.authService.logOut(session_id, refresh_token);
    CookieUtil.clearAuthCookies(res);
    this.logger.log(this.context, 'logout success', {
      sessionId: session_id,
    });
    return result;
  }

  @RateLimit({ limit: 30, ttl: 60 })
  @Post('refresh')
  async refresh(
    @Req() req: AuthRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { refresh_token, session_id }: JwtCookies = req.cookies;
    this.logger.log(this.context, 'token refresh attempt', {
      sessionId: session_id,
    });
    const result = await this.authService.refresh(session_id, refresh_token);
    CookieUtil.setAuthCookies(res, result.data);
    this.logger.log(this.context, 'token refresh attempt', {
      sessionId: session_id,
    });
    return { message: result.message };
  }

  @Public()
  @RateLimit({ limit: 3, ttl: 300 })
  @Post('forgot-password')
  async forgotPassword(@Body() body: { email: string }) {
    return this.authService.forgotPassword(body);
  }

  @Public()
  @RateLimit({ limit: 5, ttl: 300 })
  @Post('reset-password')
  async resetPassword(@Body() body: ResetPasswordDto) {
    return this.authService.resetPassword(body);
  }

  private async socialAuthRedirect(req: Request) {
    const data = req.user as GoogleDto | TwitterDto;
    const userAgent = req.headers['user-agent'] || 'unknown-device';
    const ip = req.ip || req.socket.remoteAddress || 'unknown-ip';
    const redirect_url = this.config.getOrThrow<AppType>('app').redirectUrl;
    return { data, userAgent, ip, redirect_url };
  }
}
