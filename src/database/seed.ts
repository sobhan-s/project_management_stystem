import { logger } from '../config/logger.config.js';
import { getDB } from './Db.js';

export const seedRBACData = () => {
  const db = getDB();
  const permissionCount = db
    .prepare('SELECT COUNT(*) as count FROM permissions')
    .get() as { count: number };

  if (permissionCount.count > 0) {
    return;
  }

  db.exec(`
    INSERT INTO permissions (name, description, resource, action) VALUES
    ('project:view', 'View project details', 'project', 'view'),
    ('project:update', 'Update project details', 'project', 'update'),
    ('project:delete', 'Delete project', 'project', 'delete'),
    ('project:archive', 'Archive/unarchive project', 'project', 'archive'),
    ('member:list', 'View project members list', 'member', 'list'),
    ('member:add', 'Add new members to project', 'member', 'add'),
    ('member:update', 'Update member roles', 'member', 'update'),
    ('member:remove', 'Remove members from project', 'member', 'remove');

    INSERT INTO roles (name, description, level) VALUES
    ('OWNER', 'Project owner with full control', 1),
    ('ADMIN', 'Project administrator', 2),
    ('MEMBER', 'Regular project member', 3);

    INSERT INTO role_permissions (role_id, permission_id)
    SELECT r.id, p.id
    FROM roles r
    JOIN permissions p
    WHERE r.name = 'OWNER';

    INSERT INTO role_permissions (role_id, permission_id)
    SELECT r.id, p.id
    FROM roles r
    JOIN permissions p
    WHERE r.name = 'ADMIN'
    AND p.name IN (
        'project:view',
        'project:update',
        'project:archive',
        'member:list',
        'member:add',
        'member:update',
        'member:remove'
    );

    INSERT INTO role_permissions (role_id, permission_id)
    SELECT r.id, p.id
    FROM roles r
    JOIN permissions p
    WHERE r.name = 'MEMBER'
    AND p.name IN (
        'project:view',
        'member:list'
    );
  `);

  logger.info('RBAC seed data inserted');
};
