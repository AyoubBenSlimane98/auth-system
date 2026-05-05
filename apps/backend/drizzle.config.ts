import dotenv from 'dotenv';
import { defineConfig } from 'drizzle-kit';

dotenv.config({ path: `.env.${process.env.NODE_ENV || 'development'}` });

const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error('DATABASE_URL is missing in drizzle.config');
}

export default defineConfig({
  out: './drizzle',
  schema: './src/database/schema',
  dialect: 'postgresql',
  dbCredentials: {
    url,
  },
});
