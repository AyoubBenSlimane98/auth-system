import { registerAs } from '@nestjs/config';

export default registerAs('argon', () => ({
  secret: process.env.ARGON_SECRET,
}));
