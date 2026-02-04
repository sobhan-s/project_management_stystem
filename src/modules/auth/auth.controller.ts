import type { Request, Response } from 'express';
import { ApiResponse } from '../../utils/ApiResponse.js';
import {
  registerUser,
  verifyEmail,
  resendVerification,
  loginUser,
  logoutUser,
  refreshAccessToken,
  requestPasswordReset,
  resetPassword,
  verifyEmailManual,
} from './auth.service.js';
import {
  resetPasswordSchemaToken,
  verifyEmailSchema,
  verifyEmailSchemaManual,
} from '../../validations/index.js';
import { ApiError } from '../../utils/ApiError.js';
import { logger } from '../../config/logger.config.js';

export const register = async (req: Request, res: Response) => {
  const result = await registerUser(req.body);
  const response = new ApiResponse(
    201,
    result,
    'Registration successful. Please verify your email.',
  );
  res
    .status(response.statusCode)
    .json({ success: true, message: response.message, data: response.data });
};

export const verifyEmailHandler = async (req: Request, res: Response) => {
  // console.log(req.body.token);
  const result = verifyEmailSchema.safeParse(req.query);
  if (!result.success) {
    logger.info('error in req.query in validation of email handleer');
    throw new ApiError(400, result.error.message);
  }
  const { token } = result.data;
  console.log(token);
  verifyEmail(token);
  const response = new ApiResponse(200, null, 'Email verified successfully');
  res
    .status(response.statusCode)
    .json({ success: true, message: response.message, data: response.data });
};

export const verifyEmailManualHandler = async (req: Request, res: Response) => {
  const email = req.body.email;
  verifyEmailManual(email);
  res.status(200).json({ success: true });
};

export const resendVerificationHandler = async (
  req: Request,
  res: Response,
) => {
  await resendVerification(req.body.email);
  const response = new ApiResponse(
    200,
    null,
    'If the email exists, a verification link has been sent.',
  );
  res
    .status(response.statusCode)
    .json({ success: true, message: response.message, data: response.data });
};

export const login = async (req: Request, res: Response) => {
  const result = await loginUser(req.body);
  const response = new ApiResponse(200, result, 'Logged in successfully');
  res
    .status(response.statusCode)
    .json({ success: true, message: response.message, data: response.data });
};

export const logout = async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const refreshToken = req.body?.refreshToken;
  logoutUser(userId, refreshToken);
  const response = new ApiResponse(200, null, 'Logged out successfully');
  res
    .status(response.statusCode)
    .json({ success: true, message: response.message, data: response.data });
};

export const refresh = async (req: Request, res: Response) => {
  const result = refreshAccessToken(req.body.refreshToken);
  const response = new ApiResponse(200, result, 'Token refreshed successfully');
  res
    .status(response.statusCode)
    .json({ success: true, message: response.message, data: response.data });
};

export const forgotPassword = async (req: Request, res: Response) => {
  await requestPasswordReset(req.body.email);
  const response = new ApiResponse(
    200,
    null,
    'If the email exists, a reset link has been sent.',
  );
  res
    .status(response.statusCode)
    .json({ success: true, message: response.message, data: response.data });
};

export const resetPasswordHandler = async (req: Request, res: Response) => {
  const result = resetPasswordSchemaToken.safeParse(req.query);
  if (!result.success) {
    logger.info('error in req.query in validation of email handleer');
    throw new ApiError(400, result.error.message);
  }
  const { token } = result.data;
  await resetPassword(token, req.body.password);
  const response = new ApiResponse(200, null, 'Password reset successfully');
  res
    .status(response.statusCode)
    .json({ success: true, message: response.message, data: response.data });
};
