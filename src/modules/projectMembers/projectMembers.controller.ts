import type { Request, Response } from 'express';
import { ApiResponse } from '../../utils/ApiResponse.js';
import {
  addProjectMember,
  updateProjectMemberRole,
  removeProjectMember,
  emailToIdService,
} from './projectMember.service.js';
import { getProjectMembers } from '../project/project.service.js';

export const addMemberHandler = async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const projectId = Number(req.params.projectId);
  const userEmail = req.body.userEmail;
  const takenUserId = emailToIdService(userEmail);
  const role = req.body.role;
  const result = addProjectMember(projectId, userId, takenUserId, role);
  const response = new ApiResponse(201, result, 'Member added successfully');
  res
    .status(response.statusCode)
    .json({ success: true, message: response.message, data: response.data });
};

export const getMembersHandler = async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const projectId = Number(req.params.projectId);
  console.log('aOdjfasdfiasdhf', userId, projectId);
  const result = getProjectMembers(projectId, userId);
  const response = new ApiResponse(
    200,
    result,
    'Member of project fetched Successfully',
  );
  res
    .status(response.statusCode)
    .json({ success: true, message: response.message, data: response.data });
};

export const updateMemberHandler = async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const projectId = Number(req.params.projectId);
  // const targetUserId = Number(req.params.userId);
  const email = req.query.email as string;
  if (!email) {
    return res.status(400).json({
      message: 'Email Field is not there ',
    });
  }
  const targetUserId = emailToIdService(email);
  const result = updateProjectMemberRole(
    projectId,
    userId,
    targetUserId,
    req.body,
  );
  const response = new ApiResponse(
    204,
    result,
    'Member role updated successfully',
  );
  res
    .status(response.statusCode)
    .json({ success: true, message: response.message, data: response.data });
};

export const removeMemberHandler = async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const projectId = Number(req.params.projectId);
  // const targetUserId = Number(req.params.userId);
  const email = req.query.email as string;
  if (!email) {
    return res.status(400).json({
      message: 'Email Field is not there ',
    });
  }
  const targetUserId = emailToIdService(email);
  removeProjectMember(projectId, userId, targetUserId);
  const response = new ApiResponse(204, null, 'Member removed successfully');
  res
    .status(response.statusCode)
    .json({ success: true, message: response.message, data: response.data });
};
