import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { AppException } from '../../../common/filters';
import { ErrorCode } from '../../../common/enums';
import type { DbTx, DB } from '../../../database/types';
import { SessionsRepository } from '../../sessions/repository/sessions.repository';
import { UsersRepository } from '../../users/repository/users.repository';
import { ProvidersRepository } from '../../providers/repository/providers.repository';
import { Argon2Service } from './argon2.service';
import { JwtAuthService } from './jwt-auth.service';
import { SendGridService } from './sendgrid.service';
import { TokensRepository } from '../../tokens/repository/tokens.repository';
import { DATABASE_CONNECTION } from '../../../database/constants';
import { ProviderEnum } from '../../providers/enums/providers.enum';
import {
  GoogleDto,
  LocalSignInDto,
  LocalSignUpDto,
  ResetPasswordDto,
} from '../dtos';

@Injectable()
export class AuthService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: DB,
    private readonly refreshTokenRepo: TokensRepository,
    private readonly sessionsRepo: SessionsRepository,
    private readonly usersRepo: UsersRepository,
    private readonly providersRepo: ProvidersRepository,
    private readonly argon2Service: Argon2Service,
    private readonly jwtAuthService: JwtAuthService,
    private readonly sendGridService: SendGridService,
  ) {}

  async localSignUp(body: LocalSignUpDto) {
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
    return {
      message: 'Created new user successfully',
      data: result,
    };
  }

  async googleAuthRedirect(data: GoogleDto, userAgent: string, ip: string) {
    return await this.db.transaction(async (tx) => {
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
          message: 'Failed to create or find user 1',
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
      const tokens = await this.storeTokens(
        {
          provider_id: provider.provider_id,
          user_agent: userAgent,
          ip_address: ip,
        },
        tx,
      );
      return tokens;
    });
  }

  async verificationEmail(token: string) {
    const payload = await this.jwtAuthService.verifyEmailToken(token);

    const provider = await this.providersRepo.findByUserIdAndType(
      payload.sub,
      ProviderEnum.LOCAL,
    );
    if (!provider) {
      throw new AppException({
        message: 'User not found',
        code: ErrorCode.USER_NOT_FOUND,
        statusCode: HttpStatus.NOT_FOUND,
      });
    }
    if (provider.is_email_verified) {
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
    return {
      message: 'Email verified successfully',
      data: {
        user_id: provider.user_id,
        is_email_verified: provider.is_email_verified,
      },
    };
  }

  async resendVerification(body: { email: string }) {
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
      return {
        message: 'Email already verified',
      };
    }

    await this.sendTokenByEmail(provider.provider_id, body.email);

    return {
      message: 'Verification email sent successfully',
    };
  }

  async localSignIn(body: LocalSignInDto, userAgent: string, ip: string) {
    const user = await this.usersRepo.findByEmail(body.email);
    if (!user) {
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
      throw new AppException({
        message: 'Invalid email or password',
        code: ErrorCode.UNAUTHORIZED,
        statusCode: HttpStatus.UNAUTHORIZED,
        data: { fields: ['email', 'password'] },
      });
    }
    if (!provider.is_email_verified) {
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
    if (!session_id || !refresh_token) {
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

    return {
      message: 'Logged out successfully',
    };
  }

  async refresh(session_id: string, refresh_token: string) {
    if (!session_id || !refresh_token) {
      throw new AppException({
        message: 'Missing authentication cookies',
        code: ErrorCode.TOKEN_INVALID,
        statusCode: HttpStatus.UNAUTHORIZED,
      });
    }

    const session = await this.sessionsRepo.findById(session_id);

    if (!session || session.is_revoked) {
      throw new AppException({
        message: 'Session invalid',
        code: ErrorCode.SESSION_INVALID,
        statusCode: HttpStatus.UNAUTHORIZED,
      });
    }

    const oldRt =
      await this.refreshTokenRepo.findLatestRefreshTokenBySession(session_id);

    if (!oldRt || oldRt.is_revoked) {
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

    return {
      message: 'Refresh token successful',
      data: {
        ...tokens,
        session_id,
      },
    };
  }

  async fogotPassword(body: { email: string }) {
    const user = await this.usersRepo.findByEmail(body.email);
    if (!user) {
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
      await this.sendGridService.sendEmailResetPassword(body.email, token);
    }

    return {
      message: 'If this email exists, you will receive a reset link',
    };
  }

  async resetPassword(body: ResetPasswordDto) {
    const payload = await this.jwtAuthService.verifyResetPassordToken(
      body.token,
    );

    const provider = await this.providersRepo.findByUserIdAndType(
      payload.sub,
      ProviderEnum.LOCAL,
    );

    if (!provider || !provider.is_email_verified || !provider.hash_password) {
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
    });

    return {
      message: 'Password reset successfully',
    };
  }

  private async sendTokenByEmail(provider_id: string, email: string) {
    const token =
      await this.jwtAuthService.generateVerifyEmailToken(provider_id);
    await this.sendGridService.sendEmailVerifyAccount(email, token);
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

    return {
      refresh_token,
      access_token,
      session_id: session.session_id,
    };
  }
}
