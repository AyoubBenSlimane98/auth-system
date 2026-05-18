import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import sgMail from '@sendgrid/mail';
import { AppType, SendGridType } from '../../../../configuration/types';
import { AppException } from '../../../../common/filters';
import { ErrorCode } from '../../../../common/enums';
import { LoggerService } from '../../../logs/logger.service';

@Injectable()
export class SendGridService {
  private context: string = SendGridService.name;
  private readonly from: string;
  private readonly link: string;

  constructor(
    private readonly config: ConfigService,
    private readonly logger: LoggerService,
  ) {
    const apiKey = this.config.getOrThrow<SendGridType>('sendgrid').apiKey;
    if (!apiKey) {
      throw new AppException({ message: 'Missing API key' });
    }
    this.from = this.config.getOrThrow<SendGridType>('sendgrid').from;
    if (!this.from) {
      throw new AppException({ message: 'Missing Rsender email' });
    }
    this.link = config.getOrThrow<AppType>('app').frontendUrl;

    if (!this.link) {
      throw new AppException({ message: 'Missing Url email verify email' });
    }
    sgMail.setApiKey(apiKey);
  }

  async sendEmailVerifyAccount(email: string, token: string) {
    const context = SendGridService.name;
    const url = `${this.link}/verify-email?token=${token}`;
    this.logger.log(context, 'sending verify account email', {
      email,
    });
    try {
      await sgMail.send({
        to: email,
        from: this.from,
        subject: 'Verify Account',
        html: `
  <div style="font-family: Arial, sans-serif; background-color: #f4f4f7; padding: 40px 0;">
    <table align="center" width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background: #ffffff; border-radius: 8px; overflow: hidden;">

      <tr>
        <td style="background-color: #4f46e5; padding: 20px; text-align: center; color: white; font-size: 20px; font-weight: bold;">
          Verify Your Account
        </td>
      </tr>


      <tr>
        <td style="padding: 30px; color: #333;">
          <p style="font-size: 16px; margin-bottom: 20px;">
            Thanks for signing up! Please confirm your email address by clicking the button below.
          </p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${url}"
              style="background-color: #4f46e5; color: #ffffff; padding: 12px 20px; text-decoration: none; border-radius: 6px; font-size: 16px; display: inline-block;">
              Verify Email
            </a>
          </div>

          <p style="font-size: 14px; color: #666;">
            If the button doesn't work, copy and paste this link into your browser:
          </p>

          <a href="${url}" style="word-break: break-all; font-size: 13px; color: #4f46e5;">
              http://my-app-auth/verify-email
          </a>
          <p style="font-size: 14px; color: #666;">
            This link will expire in 10 minutes.
          </p>
        </td>
      </tr>

      <!-- Footer -->
      <tr>
        <td style="padding: 20px; text-align: center; font-size: 12px; color: #999;">
          If you didn’t create an account, you can safely ignore this email.
        </td>
      </tr>

    </table>
  </div>
`,
      });
      this.logger.log(context, 'verify account sent successfully', {
        email,
      });
      return {
        message: 'Verification email sent successfully',
        data: {
          email,
        },
      };
    } catch (err) {
      this.logger.logError(
        context,
        'failed to send verify account email',
        err,
        {
          email,
        },
      );
      throw new AppException({
        message: 'Failed to send verification email',
        code: ErrorCode.EMAIL_SEND_FAILED,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }
  }

  async sendEmailResetPassword(email: string, token: string) {
    const url = `${this.link}/reset-password?token=${token}`;
    const context = SendGridService.name;
    this.logger.log(context, 'sending reset password email', {
      email,
    });
    try {
      await sgMail.send({
        to: email,
        from: this.from,
        subject: 'Reset your password',
        html: `
  <div style="font-family: Arial, sans-serif; background-color: #f4f4f7; padding: 40px 0;">
    <table align="center" width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background: #ffffff; border-radius: 8px; overflow: hidden;">

      <tr>
        <td style="background-color: #4f46e5; padding: 20px; text-align: center; color: white; font-size: 20px; font-weight: bold;">
          Reset Your Password
        </td>
      </tr>

      <tr>
        <td style="padding: 30px; color: #333;">
          <p style="font-size: 16px; margin-bottom: 20px;">
            We received a request to reset your password. Click the button below to set a new password.
          </p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${url}"
              style="background-color: #4f46e5; color: #ffffff; padding: 12px 20px; text-decoration: none; border-radius: 6px; font-size: 16px; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p style="font-size: 14px; color: #666;">
            This link will expire in 10 minutes.
          </p>
        </td>
      </tr>
      <tr>
        <td style="padding: 22px; text-align: center; font-size: 12px; color: #999;">
          If you didn’t request a password reset, you can safely ignore this email.
        </td>
      </tr>

    </table>
  </div>
`,
      });
      this.logger.log(context, 'reset password sent successfully', { email });
    } catch (err) {
      this.logger.logError(
        context,
        'failed to send reset password email',
        err,
        {
          email,
        },
      );
      throw new AppException({
        message: 'Failed to send reset password email',
        code: ErrorCode.EMAIL_SEND_FAILED,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }
  }
}
