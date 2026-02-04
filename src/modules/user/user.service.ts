import bcrypt from 'bcrypt';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { ApiError } from '../../utils/ApiError.js';
import { logger } from '../../config/logger.config.js';
import { userRepository } from '../../repository/user.repository.js';
import { refreshTokenRepository } from '../../repository/token.repository.js';
import { mapUser, type UserResponse } from '../../mappers/index.js';

export const getCurrentUser = (userId: number): UserResponse => {
  logger.info('Fetching current user', { userId });

  const user = userRepository.findById(userId);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  return mapUser(user);
};

export const getUserById = (userId: number): UserResponse => {
  logger.info('Fetching user by ID', { userId });

  const user = userRepository.findById(userId);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  return mapUser(user);
};

export const updateCurrentUser = (
  userId: number,
  data: { first_name?: string; last_name?: string; username?: string },
): UserResponse => {
  logger.info('Updating current user', { userId });

  const user = userRepository.findById(userId);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  if (data.username && data.username !== user.username) {
    const existingUsername = userRepository.findByUsername(data.username);
    if (existingUsername) {
      throw new ApiError(409, 'Username already taken');
    }
  }

  const updatedUser = userRepository.update(userId, data);
  if (!updatedUser) {
    throw new ApiError(500, 'Failed to update user');
  }

  logger.info('User updated successfully', { userId });
  return mapUser(updatedUser);
};

export const changePassword = async (
  userId: number,
  data: { currentPassword: string; newPassword: string },
): Promise<void> => {
  logger.info('Attempting to change password', { userId });

  const user = userRepository.findById(userId);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  const isCurrentPasswordValid = await bcrypt.compare(
    data.currentPassword,
    user.password_hash,
  );
  if (!isCurrentPasswordValid) {
    throw new ApiError(404, 'Current password is incorrect');
  }

  const salt = await bcrypt.genSalt(12);
  const newPasswordHash = await bcrypt.hash(data.newPassword, salt);

  userRepository.updatePassword(userId, newPasswordHash);
  refreshTokenRepository.deleteByUserId(userId);

  logger.info('Password changed successfully', { userId });
};

export const deleteAccount = (userId: number): void => {
  logger.info('Deleting user account', { userId });

  const user = userRepository.findById(userId);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  userRepository.delete(userId);

  logger.info('User account deleted', { userId });
};
