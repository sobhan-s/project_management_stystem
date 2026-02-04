import type { Request, Response } from 'express';
import { ApiResponse } from '../../utils/ApiResponse.js';
import {
  getCurrentUser,
  getUserById,
  updateCurrentUser,
  changePassword,
  deleteAccount,
} from './user.service.js';

export const getMe = async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const result = getCurrentUser(userId);
  const response = new ApiResponse(200, result);
  res
    .status(response.statusCode)
    .json({ success: true, message: response.message, data: response.data });
};

export const updateMe = async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const result = updateCurrentUser(userId, req.body);
  const response = new ApiResponse(204, result, 'Profile updated successfully');
  res
    .status(response.statusCode)
    .json({ success: true, message: response.message, data: response.data });
};

export const deleteMe = async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  deleteAccount(userId);
  const response = new ApiResponse(204, null, 'Account deleted successfully');
  res
    .status(response.statusCode)
    .json({ success: true, message: response.message, data: response.data });
};

export const changePasswordHandler = async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  await changePassword(userId, req.body);
  const response = new ApiResponse(204, null, 'Password changed successfully');
  res
    .status(response.statusCode)
    .json({ success: true, message: response.message, data: response.data });
};

export const getUserByIdHandler = async (req: Request, res: Response) => {
  const userId = Number(req.params.userId);
  if (!userId) {
    res.status(400).json({
      message: 'Can not find the user id',
    });
  }
  const targetUserId = userId;
  const result = getUserById(targetUserId);
  const response = new ApiResponse(200, result);
  res
    .status(response.statusCode)
    .json({ success: true, message: response.message, data: response.data });
};
