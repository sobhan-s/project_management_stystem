import type { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError.js';
import { verifyAccessToken } from '../helpers/token.js';
import { logger } from '../config/logger.config.js';

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;
  // console.log(authHeader);

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new ApiError(401, 'Authorization header is required');
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = verifyAccessToken(token as string);
    (req as any).userId = payload.userId;
    (req as any).email = payload.email;
    logger.debug('Auth middleware passed', { userId: payload.userId });
    next();
  } catch {
    throw new ApiError(401, 'Invalid or expired access token');
  }
};
