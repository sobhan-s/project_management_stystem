import type { Request, Response } from 'express';
import { ApiResponse } from '../../utils/ApiResponse.js';
import {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
} from './project.service.js';

export const createProjectHandler = async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const result = createProject(userId, req.body);
  const response = new ApiResponse(201, result, 'Project created successfully');
  res
    .status(response.statusCode)
    .json({ success: true, message: response.message, data: response.data });
};

export const getProjectsHandler = async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const result = getProjects(userId);
  const response = new ApiResponse(200, result);
  res
    .status(response.statusCode)
    .json({ success: true, message: response.message, data: response.data });
};

export const getProjectByIdHandler = async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const projectId = Number(req.params.projectId);
  const result = getProjectById(projectId, userId);
  const response = new ApiResponse(200, result);
  res
    .status(response.statusCode)
    .json({ success: true, message: response.message, data: response.data });
};

export const updateProjectHandler = async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const projectId = Number(req.params.projectId);
  const result = updateProject(projectId, userId, req.body);
  const response = new ApiResponse(204, result, 'Project updated successfully');
  res
    .status(response.statusCode)
    .json({ success: true, message: response.message, data: response.data });
};

export const deleteProjectHandler = async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const projectId = Number(req.params.projectId);
  deleteProject(projectId, userId);
  const response = new ApiResponse(204, null, 'Project deleted successfully');
  res
    .status(response.statusCode)
    .json({ success: true, message: response.message, data: response.data });
};
