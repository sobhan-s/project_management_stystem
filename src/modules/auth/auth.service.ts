import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { ApiError } from '../../utils/ApiError.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { logger } from '../../config//logger.config.js';
import { config } from '../../config/envConfig.js';
import { userRepository } from '../../repository/user.repository.js';
import {
  emailVerificationTokenRepository,
  passwordResetTokenRepository,
  refreshTokenRepository,
} from '../../repository/token.repository.js';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  getExpiryDate,
} from '../../helpers/token.js';
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
} from '../../config/mail.config.js';
import { mapUser, type UserResponse } from '../../mappers/index.js';

export const registerUser = async (data: {
  email: string;
  username: string;
  password: string;
  first_name?: string;
  last_name?: string;
}): Promise<UserResponse> => {
  logger.info('Attempting to register user', {
    email: data.email,
    username: data.username,
  });

  const existingEmail = userRepository.findByEmail(data.email);
  if (existingEmail) {
    throw new ApiError(409, 'Email already registered');
  }

  const existingUsername = userRepository.findByUsername(data.username);
  if (existingUsername) {
    throw new ApiError(409, 'Username already taken');
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(data.password, salt);

  const user = userRepository.create({
    email: data.email,
    username: data.username,
    password_hash: passwordHash,
    ...(data.first_name && { first_name: data.first_name }),
    ...(data.last_name && { last_name: data.last_name }),
  });

  const token = uuidv4();
  const expiresAt: string = getExpiryDate(config.email.verificationExpiresIn);
  emailVerificationTokenRepository.create(user.id, token, expiresAt);

  await sendVerificationEmail(data.email, token);

  logger.info('User registered successfully', { userId: user.id });
  return mapUser(user);
};

export const verifyEmail = (token: string): void => {
  logger.info('Attempting to verify email');

  const verificationToken = emailVerificationTokenRepository.findByToken(token);

  if (!verificationToken) {
    throw new ApiError(400, 'Invalid verification token');
  }

  if (verificationToken.is_used === 1) {
    throw new ApiError(400, 'Token already used');
  }

  if (new Date(verificationToken.expires_at) < new Date()) {
    throw new ApiError(400, 'Token has expired');
  }

  userRepository.markEmailVerified(verificationToken.user_id);
  emailVerificationTokenRepository.markUsed(verificationToken.id);

  logger.info('Email verified successfully', {
    userId: verificationToken.user_id,
  });
};

export const verifyEmailManual = (email: string): void => {
  logger.info('Attempting to verify email manually ');
  userRepository.markEmailVerifiedByEmailManual(email);
  logger.info('Email verified successfully');
};

export const resendVerification = async (email: string): Promise<void> => {
  logger.info('Attempting to resend verification email', { email });

  const user = userRepository.findByEmail(email);
  if (!user) {
    return;
  }

  if (user.is_email_verified === 1) {
    return;
  }

  emailVerificationTokenRepository.deleteByUserId(user.id);

  const token = uuidv4();
  const expiresAt = getExpiryDate(config.email.verificationExpiresIn);
  emailVerificationTokenRepository.create(user.id, token, expiresAt);

  await sendVerificationEmail(email, token);

  logger.info('Verification email resent', { userId: user.id });
};

export const loginUser = async (data: {
  email: string;
  password: string;
}): Promise<{
  accessToken: string;
  refreshToken: string;
  user: UserResponse;
}> => {
  logger.info('Attempting login', { email: data.email });

  const user = userRepository.findByEmail(data.email);
  if (!user) {
    throw new ApiError(401, 'Invalid email or password');
  }

  if (user.is_active === 0) {
    throw new ApiError(401, 'Account has been deactivated');
  }

  const isPasswordValid = await bcrypt.compare(
    data.password,
    user.password_hash,
  );
  if (!isPasswordValid) {
    throw new ApiError(401, 'Invalid email or password');
  }

  if (user.is_email_verified === 0) {
    throw new ApiError(
      403,
      'Email not verified. Please verify your email first.',
    );
  }

  const accessToken = generateAccessToken(user.id, user.email);
  const refreshToken = generateRefreshToken(user.id, user.email);

  const refreshExpiresAt = getExpiryDate(config.jwt.refreshExpiresIn);
  refreshTokenRepository.create(user.id, refreshToken, refreshExpiresAt);

  logger.info('User logged in successfully', { userId: user.id });

  return {
    accessToken,
    refreshToken,
    user: mapUser(user),
  };
};

export const logoutUser = (userId: number, refreshToken?: string): void => {
  logger.info('Attempting logout', { userId });

  if (refreshToken) {
    refreshTokenRepository.deleteByToken(refreshToken);
  } else {
    refreshTokenRepository.deleteByUserId(userId);
  }

  logger.info('User logged out', { userId });
};

export const refreshAccessToken = (
  refreshToken: string,
): { accessToken: string; refreshToken: string } => {
  logger.info('Attempting to refresh access token');

  const storedToken = refreshTokenRepository.findByToken(refreshToken);
  if (!storedToken) {
    throw new ApiError(401, 'Invalid refresh token');
  }

  if (new Date(storedToken.expires_at) < new Date()) {
    refreshTokenRepository.deleteByToken(refreshToken);
    throw new ApiError(401, 'Refresh token has expired');
  }

  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    refreshTokenRepository.deleteByToken(refreshToken);
    throw new ApiError(401, 'Invalid refresh token');
  }

  const user = userRepository.findById(payload.userId);
  if (!user) {
    refreshTokenRepository.deleteByToken(refreshToken);
    throw new ApiError(404, 'User not found');
  }

  refreshTokenRepository.deleteByToken(refreshToken);

  const newAccessToken = generateAccessToken(user.id, user.email);
  const newRefreshToken = generateRefreshToken(user.id, user.email);

  const refreshExpiresAt = getExpiryDate(config.jwt.refreshExpiresIn);
  refreshTokenRepository.create(user.id, newRefreshToken, refreshExpiresAt);

  logger.info('Access token refreshed', { userId: user.id });

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
};

export const requestPasswordReset = async (email: string): Promise<void> => {
  logger.info('Requesting password reset', { email });

  const user = userRepository.findByEmail(email);
  if (!user) {
    return;
  }

  passwordResetTokenRepository.deleteByUserId(user.id);

  const token = uuidv4();
  const expiresAt = getExpiryDate(config.email.passwordResetExpiresIn);
  passwordResetTokenRepository.create(user.id, token, expiresAt);

  await sendPasswordResetEmail(email, token);

  logger.info('Password reset email sent', { userId: user.id });
};

export const resetPassword = async (
  token: string,
  newPassword: string,
): Promise<void> => {
  logger.info('Attempting to reset password');

  const resetToken = passwordResetTokenRepository.findByToken(token);
  if (!resetToken) {
    throw new ApiError(400, 'Invalid reset token');
  }

  if (resetToken.is_used === 1) {
    throw new ApiError(400, 'Token already used');
  }

  if (new Date(resetToken.expires_at) < new Date()) {
    throw new ApiError(400, 'Token has expired');
  }

  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(newPassword, salt);

  userRepository.updatePassword(resetToken.user_id, passwordHash);
  passwordResetTokenRepository.markUsed(resetToken.id);
  refreshTokenRepository.deleteByUserId(resetToken.user_id);

  logger.info('Password reset successfully', { userId: resetToken.user_id });
};
