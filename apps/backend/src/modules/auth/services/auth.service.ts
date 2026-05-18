import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { AppException } from '../../../common/filters';
import { ErrorCode } from '../../../common/enums';
import { SessionsRepository } from '../../sessions/repository/sessions.repository';
import { UsersRepository } from '../../users/repository/users.repository';
import { ProvidersRepository } from '../../providers/repository/providers.repository';
import { Argon2Service } from './argon2.service';
import { JwtAuthService } from './jwt-auth.service';
import { TokensRepository } from '../../tokens/repository/tokens.repository';
import { ProviderEnum } from '../../providers/enums/providers.enum';
import {
  GoogleDto,
  LocalSignInDto,
  LocalSignUpDto,
  ResetPasswordDto,
  TwitterDto,
} from '../dtos';
import type { Response } from 'express';
import { CookieUtil } from '../utils';
import { InjectQueue } from '@nestjs/bullmq';
import { EMAIL_QUEUE } from '../../../infrastructure/queue/constants';
import { Queue } from 'bullmq';
import { DATABASE_CONNECTION } from '../../../infrastructure/database/constants';
import type { DB, DbTx } from '../../../infrastructure/database/types';
import { LoggerService } from '../../../infrastructure/logs/logger.service';

@Injectable()
export class AuthService {
  private readonly context = AuthService.name;
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: DB,
    @InjectQueue(EMAIL_QUEUE) private readonly emailQueue: Queue,
    private readonly refreshTokenRepo: TokensRepository,
    private readonly sessionsRepo: SessionsRepository,
    private readonly usersRepo: UsersRepository,
    private readonly providersRepo: ProvidersRepository,
    private readonly argon2Service: Argon2Service,
    private readonly jwtAuthService: JwtAuthService,
    private readonly logger: LoggerService,
  ) {}

  async localSignUp(body: LocalSignUpDto) {
    this.logger.log(this.context, 'signup started', { email: body.email });
    const hashPassword = await this.argon2Service.hashData(body.password);
    const result = await this.db.transaction(async (tx) => {
      await this.usersRepo.createUserIfNotExists(
        {
          first_name: body.firstName,
          last_name: body.lastName,
          email: body.email,
        },
        tx,
      );
      const user = await this.usersRepo.findByEmail(body.email, tx);
      if (!user) {
        this.logger.logWarn(this.context, 'Failed to create user', {
          email: body.email,
          reasion: 'user_not_found',
        });
        throw new AppException({
          message: 'Failed to create user',
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          code: ErrorCode.INTERNAL_SERVER_ERROR,
        });
      }
      const providerCreated =
        await this.providersRepo.createLocalProviderIfNotExists(
          {
            user_id: user.user_id,
            hash_password: hashPassword,
            type: ProviderEnum.LOCAL,
          },
          tx,
        );
      if (!providerCreated) {
        this.logger.logWarn(this.context, 'provider already exists', {
          email: body.email,
          reasion: 'provider_already_exists',
        });
        throw new AppException({
          message: 'User already exists',
          statusCode: HttpStatus.CONFLICT,
          code: ErrorCode.USER_ALREADY_EXISTS,
        });
      }
      return {
        ...providerCreated,
        first_name: body.firstName,
        last_name: body.lastName,
      };
    });
    await this.sendEmailVerifyAccount(result.provider_id, body.email);
    this.logger.log(this.context, 'signup completed', { email: body.email });
    return {
      message: 'Created new user successfully',
      data: result,
    };
  }

  async localSignIn(body: LocalSignInDto, userAgent: string, ip: string) {
    this.logger.log(this.context, 'signin started', { email: body.email, ip });
    const user = await this.usersRepo.findByEmail(body.email);
    if (!user) {
      this.logger.logWarn(this.context, 'signin failed', {
        email: body.email,
        ip,
        reason: 'user_not_found',
      });
      throw new AppException({
        message: 'Invalid email or password',
        code: ErrorCode.UNAUTHORIZED,
        statusCode: HttpStatus.UNAUTHORIZED,
        data: { fields: ['email', 'password'] },
      });
    }
    const provider = await this.providersRepo.findByUserIdAndType(
      user.user_id,
      ProviderEnum.LOCAL,
    );
    if (!provider || !provider.hash_password) {
      this.logger.logWarn(this.context, 'signin failed', {
        userId: user.user_id,
        type: ProviderEnum.LOCAL,
        reason: 'provider_not_found',
      });
      throw new AppException({
        message: 'Invalid email or password',
        code: ErrorCode.USER_NOT_VERIFIED,
        statusCode: HttpStatus.UNAUTHORIZED,
        data: { fields: ['email', 'password'] },
      });
    }
    const isMatch = await this.argon2Service.verifyData(
      provider.hash_password,
      body.password,
    );
    if (!isMatch) {
      this.logger.logWarn(this.context, 'signin failed', {
        userId: user.user_id,
        type: ProviderEnum.LOCAL,
        reason: 'password_mismatch',
      });
      throw new AppException({
        message: 'Invalid email or password',
        code: ErrorCode.UNAUTHORIZED,
        statusCode: HttpStatus.UNAUTHORIZED,
        data: { fields: ['email', 'password'] },
      });
    }
    if (!provider.is_email_verified) {
      this.logger.logWarn(this.context, 'signin failed', {
        userId: user.user_id,
        type: ProviderEnum.LOCAL,
        reason: 'email_not_verified',
      });
      throw new AppException({
        message: 'Invalid email or password',
        code: ErrorCode.UNAUTHORIZED,
        statusCode: HttpStatus.UNAUTHORIZED,
      });
    }
    const result = await this.storeTokens({
      provider_id: provider.provider_id,
      user_agent: userAgent,
      ip_address: ip,
    });
    this.logger.log(this.context, 'signin completed', {
      email: body.email,
    });
    return {
      message: 'Login successful',
      data: {
        provider_id: provider.provider_id,
        user_id: provider.user_id,
        cookies: result,
      },
    };
  }

  async logOut(session_id: string, refresh_token: string) {
    this.logger.log(this.context, 'logout started', { session_id });
    if (!session_id || !refresh_token) {
      this.logger.logError(
        this.context,
        'missing authentication cookies',
        undefined,
      );
      throw new AppException({
        message: 'Missing authentication cookies',
        code: ErrorCode.TOKEN_INVALID,
        statusCode: HttpStatus.UNAUTHORIZED,
      });
    }
    const session = await this.sessionsRepo.findById(session_id);
    if (!session || session.is_revoked) {
      return { message: 'Logged out successfully' };
    }
    const oldRt =
      await this.refreshTokenRepo.findLatestRefreshTokenBySession(session_id);
    if (!oldRt) {
      return { message: 'Logged out successfully' };
    }
    const isMatch = await this.argon2Service.verifyData(
      oldRt.token_hash,
      refresh_token,
    );
    if (!isMatch) {
      this.logger.logError(this.context, 'invalid refresh token', undefined, {
        session_id,
      });
      throw new AppException({
        message: 'Invalid refresh token',
        code: ErrorCode.TOKEN_INVALID,
        statusCode: HttpStatus.UNAUTHORIZED,
      });
    }
    await this.db.transaction(async (tx) => {
      await this.sessionsRepo.revokeSession(session_id, tx);
      await this.refreshTokenRepo.revokeToken(oldRt.token_id, tx);
    });
    this.logger.log(this.context, 'logout completed', { session_id });
    return {
      message: 'Logged out successfully',
    };
  }

  async refresh(session_id: string, refresh_token: string) {
    this.logger.log(this.context, 'refresh started', { session_id });
    if (!session_id || !refresh_token) {
      this.logger.logError(
        this.context,
        'missing authentication cookies',
        undefined,
      );
      throw new AppException({
        message: 'Missing authentication cookies',
        code: ErrorCode.TOKEN_INVALID,
        statusCode: HttpStatus.UNAUTHORIZED,
      });
    }

    const session = await this.sessionsRepo.findById(session_id);

    if (!session || session.is_revoked) {
      this.logger.logWarn(this.context, 'session invalid', { session_id });
      throw new AppException({
        message: 'Session invalid',
        code: ErrorCode.SESSION_INVALID,
        statusCode: HttpStatus.UNAUTHORIZED,
      });
    }

    const oldRt =
      await this.refreshTokenRepo.findLatestRefreshTokenBySession(session_id);

    if (!oldRt || oldRt.is_revoked) {
      this.logger.logWarn(this.context, 'token invalid', { session_id });
      throw new AppException({
        message: 'Token invalid',
        code: ErrorCode.TOKEN_INVALID,
        statusCode: HttpStatus.UNAUTHORIZED,
      });
    }

    const isMatch = await this.argon2Service.verifyData(
      oldRt.token_hash,
      refresh_token,
    );

    if (!isMatch) {
      await this.db.transaction(async (tx) => {
        await this.sessionsRepo.revokeSession(session_id, tx);
        await this.refreshTokenRepo.revokeToken(oldRt.token_id, tx);
      });
      this.logger.logWarn(this.context, 'invalid refresh token', {
        session_id,
        reasin: 'refresh_token_not_verified',
      });
      throw new AppException({
        message: 'Invalid refresh token',
        code: ErrorCode.TOKEN_INVALID,
        statusCode: HttpStatus.UNAUTHORIZED,
      });
    }

    const tokens = await this.jwtAuthService.generateTokens(
      session.provider_id,
      session_id,
    );

    const hashedToken = await this.argon2Service.hashData(tokens.refresh_token);

    await this.db.transaction(async (tx) => {
      await this.refreshTokenRepo.revokeToken(oldRt.token_id, tx);

      await this.refreshTokenRepo.createRefreshToken(
        {
          session_id,
          token_hash: hashedToken,
        },
        tx,
      );

      await this.sessionsRepo.lastUsedSession(session_id, tx);
    });
    this.logger.log(this.context, 'refresh completed', { session_id });
    return {
      message: 'Refresh token successful',
      data: {
        ...tokens,
        session_id,
      },
    };
  }

  async twitterAuthRedirect(
    data: {
      data: TwitterDto;
      userAgent: string;
      ip: string;
      redirect_url: string;
    },
    res: Response,
  ) {
    this.logger.log(this.context, 'social callback started', {
      provider: data.data.type,
      ip: data.ip,
      userAgent: data.userAgent,
    });
    const result = await this.socialAuth(data.data, data.userAgent, data.ip);
    CookieUtil.setAuthCookies(res, result);
    this.logger.log(this.context, 'social callback completed', {
      provider: data.data.type,
      ip: data.ip,
      userAgent: data.userAgent,
    });
    res.redirect(data.redirect_url);
  }

  async googleAuthRedirect(
    data: {
      data: GoogleDto;
      userAgent: string;
      ip: string;
      redirect_url: string;
    },
    res: Response,
  ) {
    this.logger.log(this.context, 'social callback started', {
      provider: data.data.type,
      ip: data.ip,
      userAgent: data.userAgent,
    });
    const result = await this.socialAuth(data.data, data.userAgent, data.ip);
    CookieUtil.setAuthCookies(res, result);
    this.logger.log(this.context, 'social callback completed', {
      provider: data.data.type,
      ip: data.ip,
      userAgent: data.userAgent,
    });
    res.redirect(data.redirect_url);
  }

  async verificationEmail(token: string) {
    this.logger.log(this.context, 'verification email started');
    const payload = await this.jwtAuthService.verifyEmailToken(token);

    const provider = await this.providersRepo.findByUserIdAndType(
      payload.sub,
      ProviderEnum.LOCAL,
    );
    if (!provider) {
      this.logger.logWarn(this.context, 'user not fround', {
        providerId: payload.sub,
        type: ProviderEnum.LOCAL,
        reason: 'user_not_found',
      });
      throw new AppException({
        message: 'User not found',
        code: ErrorCode.USER_NOT_FOUND,
        statusCode: HttpStatus.NOT_FOUND,
      });
    }
    if (provider.is_email_verified) {
      this.logger.logWarn(this.context, 'email already verified', {
        providerId: payload.sub,
        type: ProviderEnum.LOCAL,
      });
      return {
        message: 'Email already verified',
        data: {
          user_id: provider.user_id,
          is_email_verified: provider.is_email_verified,
        },
      };
    }

    await this.providersRepo.markAccountAsVerified(
      payload.sub,
      ProviderEnum.LOCAL,
    );
    this.logger.log(this.context, 'verification email completed');
    return {
      message: 'Email verified successfully',
      data: {
        user_id: provider.user_id,
        is_email_verified: provider.is_email_verified,
      },
    };
  }

  async resendVerification(body: { email: string }) {
    this.logger.log(this.context, 'resend verification started', { ...body });
    const user = await this.usersRepo.findByEmail(body.email);

    if (!user) {
      throw new AppException({
        message: 'User not found',
        code: ErrorCode.USER_NOT_FOUND,
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    const provider = await this.providersRepo.findByUserIdAndType(
      user.user_id,
      ProviderEnum.LOCAL,
    );

    if (!provider) {
      throw new AppException({
        message: 'Provider not found',
        code: ErrorCode.PROVIDER_NOT_FOUND,
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    if (provider.is_email_verified) {
      this.logger.logWarn(this.context, 'email already verified', {
        providerId: provider.provider_id,
        is_email_verified: provider.is_email_verified,
      });
      return {
        message: 'Email already verified',
      };
    }

    await this.sendEmailVerifyAccount(provider.provider_id, body.email);

    this.logger.log(this.context, 'resend verification completed', { ...body });
    return {
      message: 'Verification email sent successfully',
    };
  }

  async forgotPassword(body: { email: string }) {
    this.logger.log(this.context, 'forgot password started', { ...body });
    const user = await this.usersRepo.findByEmail(body.email);
    if (!user) {
      this.logger.logWarn(this.context, 'user not found', {
        ...body,
        reason: 'user_not_found',
      });
      return {
        message: 'If this email exists, you will receive a reset link',
      };
    }
    const provider = await this.providersRepo.findByUserIdAndType(
      user.user_id,
      ProviderEnum.LOCAL,
    );
    if (provider && provider.is_email_verified) {
      const token = await this.jwtAuthService.generateResetPasswordToken(
        user.user_id,
      );
      await this.emailQueue.add(
        'reset-password',
        { email: body.email, token },
        {
          attempts: 3,
          jobId: `reset-password-${provider.provider_id}`,
          backoff: { type: 'exponential', delay: 5000 },
          removeOnComplete: { age: 180, count: 5 },
          removeOnFail: 10,
        },
      );
    }
    this.logger.log(this.context, 'forgot password completed', { ...body });
    return {
      message: 'If this email exists, you will receive a reset link',
    };
  }

  async resetPassword(body: ResetPasswordDto) {
    this.logger.log(this.context, 'reset password started');
    const payload = await this.jwtAuthService.verifyResetPassordToken(
      body.token,
    );

    const provider = await this.providersRepo.findByUserIdAndType(
      payload.sub,
      ProviderEnum.LOCAL,
    );

    if (!provider || !provider.is_email_verified || !provider.hash_password) {
      this.logger.logWarn(this.context, 'invalid or expired token', {
        providerId: payload.sub,
        type: ProviderEnum.LOCAL,
      });
      throw new AppException({
        message: 'Invalid or expired token',
        code: ErrorCode.TOKEN_INVALID,
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }

    const isSamePassword = await this.argon2Service.verifyData(
      provider.hash_password,
      body.password,
    );

    if (isSamePassword) {
      this.logger.logWarn(this.context, 'new password must be different', {
        providerId: payload.sub,
        type: ProviderEnum.LOCAL,
      });
      throw new AppException({
        message: 'New password must be different',
        code: ErrorCode.INVALID_PASSWORD,
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }

    const hashPassword = await this.argon2Service.hashData(body.password);

    await this.db.transaction(async (tx) => {
      await this.sessionsRepo.revokeAllUserSessions(provider.provider_id, tx);
      await this.refreshTokenRepo.revokeAllUserTokens(provider.provider_id, tx);
      await this.providersRepo.changePassword(
        {
          hash_passowrd: hashPassword,
          provider_id: provider.provider_id,
          type: ProviderEnum.LOCAL,
        },
        tx,
      );
      this.logger.log(this.context, 'revoke all login', {
        provider_id: provider.provider_id,
        type: ProviderEnum.LOCAL,
        reason: 'update_password',
      });
    });

    this.logger.log(this.context, 'reset password completed');
    return {
      message: 'Password reset successfully',
    };
  }

  private async sendEmailVerifyAccount(provider_id: string, email: string) {
    this.logger.log(this.context, 'send email verify account started', {
      provider_id,
    });
    const token = await this.jwtAuthService.generateVerifyEmailToken(
      provider_id,
      email,
    );
    await this.emailQueue.add(
      'verify-email',
      { email, token },
      {
        attempts: 3,
        jobId: `verify-email-${provider_id}`,
        backoff: { type: 'exponential', delay: 5000 },
        removeOnComplete: { age: 180, count: 5 },
        removeOnFail: 10,
      },
    );
    this.logger.log(this.context, 'send email verify account completed', {
      provider_id,
    });
  }

  private async storeTokens(
    data: {
      provider_id: string;
      user_agent: string;
      ip_address: string;
    },
    tx?: DbTx,
  ) {
    const db = tx ?? this.db;
    this.logger.log(this.context, 'store token started', {
      provider_id: data.provider_id,
    });
    const refresh_token = this.jwtAuthService.generateRefreshToken();

    const hashedToken = await this.argon2Service.hashData(refresh_token);
    const session = await db.transaction(async (innerTx: DbTx) => {
      const session = await this.sessionsRepo.createSession(
        {
          provider_id: data.provider_id,
          user_agent: data.user_agent,
          ip_address: data.ip_address,
        },
        innerTx,
      );

      if (!session) {
        this.logger.logWarn(this.context, 'failed to create session', {
          provider_id: data.provider_id,
          user_agent: data.user_agent,
          ip_address: data.ip_address,
        });
        throw new AppException({
          message: 'Failed to create session',
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          code: ErrorCode.INTERNAL_SERVER_ERROR,
        });
      }
      await this.refreshTokenRepo.createRefreshToken(
        {
          session_id: session.session_id,
          token_hash: hashedToken,
        },
        innerTx,
      );
      return session;
    });

    const access_token = await this.jwtAuthService.generateAccessToken(
      data.provider_id,
      session.session_id,
    );
    this.logger.log(this.context, 'store token completed', {
      provider_id: data.provider_id,
    });
    return {
      refresh_token,
      access_token,
      session_id: session.session_id,
    };
  }

  private async socialAuth(
    data: GoogleDto | TwitterDto,
    userAgent: string,
    ip: string,
  ) {
    return this.db.transaction(async (tx) => {
      this.logger.log(this.context, 'social auth started', {
        providerId: data.provider_user_id,
        type: data.type,
      });
      let user = await this.usersRepo.findByEmail(data.email, tx);

      if (!user) {
        await this.usersRepo.createUserIfNotExists(
          {
            first_name: data.first_name ?? 'user',
            last_name: data.last_name ?? 'user',
            email: data.email,
            avatar_url: data.avatar_url ?? undefined,
          },
          tx,
        );

        user = await this.usersRepo.findByEmail(data.email, tx);
      }

      if (!user) {
        throw new AppException({
          message: 'Failed to create or find user',
          code: ErrorCode.INTERNAL_SERVER_ERROR,
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        });
      }

      let provider = await this.providersRepo.createProviderIfNotExists(
        {
          user_id: user.user_id,
          type: data.type,
          provider_user_id: data.provider_user_id,
        },
        tx,
      );

      if (!provider) {
        provider = await this.providersRepo.findByProviderUserId(
          data.provider_user_id,
          tx,
        );
      }
      const result = await this.storeTokens(
        {
          provider_id: provider.provider_id,
          user_agent: userAgent,
          ip_address: ip,
        },
        tx,
      );
      this.logger.log(this.context, 'social auth completed', {
        providerId: data.provider_user_id,
        type: data.type,
      });
      return result;
    });
  }
}
