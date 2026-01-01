import { Action, Roles } from 'src/common/enum';

export const rolesMap = [
  { name: Roles.ADMIN, description: 'Full access' },
  { name: Roles.SUB_ADMIN, description: 'Limited admin access' },
  { name: Roles.MANAGER, description: 'Can manage certain resources' },
  { name: Roles.USER, description: 'Normal user' },
];

export const permissionsMap: Record<string, Action[]> = {
  roles: [Action.READ, Action.ASSIGN_PERMISSIONS],
  users: [Action.ASSIGN_ROLES],
};
