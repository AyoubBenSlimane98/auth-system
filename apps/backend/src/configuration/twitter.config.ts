import { registerAs } from '@nestjs/config';

export const twitterConfig = registerAs('twitter', () => ({
  key: process.env.TWITTER_CONSUMER_KEY,
  secret: process.env.TWITTER_CONSUMER_SECRET,
  callback_url: process.env.TWITTER_CALLBACK_URL,
}));
