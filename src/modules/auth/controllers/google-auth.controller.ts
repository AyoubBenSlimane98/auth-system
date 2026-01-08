import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { GoogleAuthGuard } from '../guards';
import type { Request, Response } from 'express';
import { Public, RateLimit } from 'src/common/decorators';
import { GoogleAuthService } from '../services';
import type { GooglePayload, GoogleUserInput } from '../interfaces';
import { AuthRateLimitGuard } from 'src/common/guards';
@UseGuards(GoogleAuthGuard)
@Controller('google-auth')
export class GoogleAuthController {
  constructor(private readonly googleAuthService: GoogleAuthService) {}
  @Public()
  @RateLimit()
  @UseGuards(AuthRateLimitGuard)
  @Get()
  async googleAuth() {}

  @Public()
  @RateLimit(3)
  @UseGuards(AuthRateLimitGuard)
  @Get('callback')
  async googleAuthRedirect(@Req() req: Request, @Res() res: Response) {
    const user = req.user as GooglePayload;
    const googleUserData = {
      email: user.email,
      first_name: user.firstName ?? '',
      last_name: user.lastName ?? '',
      provider_user_id: user.providerId,
    };

    const result = await this.googleAuthService.CreateGoogleUser(
      googleUserData as GoogleUserInput,
    );
    res.cookie('access_token', result.access_token, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
    });
    res.cookie('refresh_token', result.refresh_token, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
    });
    res.cookie('token_id', result.token_id, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
    });
    res.redirect('http://localhost:3001');
  }
}
