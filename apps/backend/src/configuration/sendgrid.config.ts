import { registerAs } from '@nestjs/config';

export const sendGridConfig = registerAs('sendgrid', () => ({
  apiKey: process.env.SENDGRID_API_KEY,
  from: process.env.SENDGRID_FROM_EMAIL,
}));
