import { registerAs } from '@nestjs/config';

export const twitterConfig = registerAs('twitter', () => ({
  clientID: process.env.TWITTER_CLIENT_ID,
  clientSecret: process.env.TWITTER_CLIENT_SECRET,
  callback_url: process.env.TWITTER_CALLBACK_URL,
}));
