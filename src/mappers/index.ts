import type { User, Project, ProjectMember } from '../interfaces/index.js';
import { userRepository } from '../repository/user.repository.js';

export interface UserResponse {
  id: number;
  email: string;
  username: string;
  first_name: string | null;
  last_name: string | null;
  is_email_verified: boolean;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectResponse {
  id: number;
  name: string;
  description: string | null;
  is_archived: boolean;
  created_by: number;
  created_at: string;
  updated_at: string;
}

export interface ProjectMemberResponse {
  id: number;
  project_id: number;
  user_id: number;
  username: string;
  email: string;
  role: string;
  joined_at: string;
}

export const mapUser = (user: User): UserResponse => ({
  id: user.id,
  email: user.email,
  username: user.username,
  first_name: user.first_name,
  last_name: user.last_name,
  is_email_verified: user.is_email_verified === 1,
  email_verified_at: user.email_verified_at,
  created_at: user.created_at,
  updated_at: user.updated_at,
});

export const mapProject = (project: Project): ProjectResponse => ({
  id: project.id,
  name: project.name,
  description: project.description,
  is_archived: project.is_archived === 1,
  created_by: project.created_by,
  created_at: project.created_at,
  updated_at: project.updated_at,
});

export const mapProjectMember = (
  member: ProjectMember,
): ProjectMemberResponse => {
  const user = userRepository.findById(member.user_id);
  return {
    id: member.id,
    project_id: member.project_id,
    user_id: member.user_id,
    username: user?.username ?? '',
    email: user?.email ?? '',
    role: member.role,
    joined_at: member.joined_at,
  };
};

export const mapProjectMembers = (
  members: ProjectMember[],
): ProjectMemberResponse[] => {
  return members.map(mapProjectMember);
};
