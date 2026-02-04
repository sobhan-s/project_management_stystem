import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const JWT_ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN;
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN;

if (!JWT_ACCESS_SECRET || !JWT_ACCESS_EXPIRES_IN) {
  throw new Error('JWT env variables are missing');
}

export const config = {
  port: parseInt(process.env.PORT || '8000', 10),
  dbPath: process.env.DB_PATH || './data/app.db',

  jwt: {
    accessSecret: JWT_ACCESS_SECRET || 'dev_access_secret',
    refreshSecret: JWT_REFRESH_SECRET || 'dev_refresh_secret',
    accessExpiresIn: JWT_ACCESS_EXPIRES_IN || '1d',
    refreshExpiresIn: JWT_REFRESH_EXPIRES_IN || '7d',
  },

  resend: {
    apiKey: process.env.RESEND_API_KEY || '',
    emailFrom: process.env.EMAIL_FROM || 'Acme <onboarding@resend.dev>',
  },

  email: {
    verificationExpiresIn: process.env.EMAIL_VERIFICATION_EXPIRES_IN || '24h',
    passwordResetExpiresIn: process.env.PASSWORD_RESET_EXPIRES_IN || '1h',
  },
};
