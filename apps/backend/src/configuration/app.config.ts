import { registerAs } from '@nestjs/config';

export const appConfig = registerAs('app', () => ({
  redirectUrl: process.env.APP_REDIRECT_FRONTEND,
  frontendUrl: process.env.APP_FRONTEND_URL,
  port: Number(process.env.APP_PORT) || 3002,
}));
