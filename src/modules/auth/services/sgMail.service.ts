import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as sgMail from '@sendgrid/mail';

@Injectable()
export class SgMailService {
  constructor(private readonly config: ConfigService) {
    sgMail.setApiKey(config.getOrThrow<string>('sgmail.key'));
  }

  async sendEmailToken(token: string, email: string) {
    const verifyUrl = `${this.config.getOrThrow<string>(
      'app.frontend_url',
    )}/verify-email?token=${token}`;
    const msg = {
      to: email,
      from: this.config.getOrThrow<string>('sgmail.email'),
      subject: 'Verify your email',
      text: `Verify your email using this link: ${verifyUrl}`,
      html: `
        <p>Welcome 👋</p>
        <p>Please verify your email by clicking the link below:</p>
        <a href="${verifyUrl}" target="_blank">Verify Email</a>
      `,
    };

    try {
      await sgMail.send(msg);
    } catch {
      throw new InternalServerErrorException({
        message: 'Failed to send email',
      });
    }
  }
}
