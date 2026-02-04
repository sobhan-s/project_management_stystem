import jwt from 'jsonwebtoken';
import { config } from '../config/envConfig.js';
import type { TokenPayload } from '../interfaces/index.js';
import ms from 'ms';
import type { StringValue } from 'ms';

export const generateAccessToken = (userId: number, email: string): string => {
  const payload: TokenPayload = { userId, email, type: 'access' };
  if (!config.jwt.accessSecret || !config.jwt.accessExpiresIn) {
    throw new Error('JWT env variables are missing');
  }

  return jwt.sign(payload, config.jwt.accessSecret, { expiresIn: '1d' });
};

export const generateRefreshToken = (userId: number, email: string): string => {
  const payload: TokenPayload = { userId, email, type: 'refresh' };
  return jwt.sign(payload, config.jwt.refreshSecret, { expiresIn: '7d' });
};

export const verifyAccessToken = (token: string): TokenPayload => {
  return jwt.verify(token, config.jwt.accessSecret) as TokenPayload;
};

export const verifyRefreshToken = (token: string): TokenPayload => {
  return jwt.verify(token, config.jwt.refreshSecret) as TokenPayload;
};

export const getExpiryDate = (duration: string): string => {
  const milliseconds = ms(duration as StringValue);
  if (!milliseconds) {
    return new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  }
  return new Date(Date.now() + milliseconds).toISOString();
};
