import { registerAs } from '@nestjs/config';

export const queueConfig = registerAs('queue', () => ({
  host: process.env.QUEUE_HOST || 'queue',
  port: Number(process.env.QUEUE_PORT) || 6379,
  password: process.env.QUEUE_PASSWORD,
}));
