import { registerAs } from '@nestjs/config';

export default registerAs('sgmail', () => ({
  key: process.env.SENDGRID_API_KEY,
  email: process.env.SENDGRID_FROM_EMAIL,
}));
