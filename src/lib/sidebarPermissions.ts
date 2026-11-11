import type { PermissionCode, UserRole } from '../types/index.ts';

export interface SidebarPermissionItem {
  title: string;
  path: string;
  roles: UserRole[];
  requiredPermissions?: PermissionCode[];
}

/**
 * Evaluates whether an item should appear in the sidebar for the authenticated role and PBAC grant set.
 */
export function hasSidebarItemAccess(
  item: SidebarPermissionItem,
  userRole: UserRole,
  canAny: (permissions: PermissionCode[]) => boolean
): boolean {
  if (!item.roles.includes(userRole)) {
    return false;
  }
  if (!item.requiredPermissions || item.requiredPermissions.length === 0) {
    return true;
  }
  if (userRole === 'ADMIN') {
    return true;
  }
  return canAny(item.requiredPermissions);
}

/**
 * Filters a list of sidebar navigation items by user role and granular PBAC permissions.
 */
export function filterSidebarItems<T extends SidebarPermissionItem>(
  items: T[],
  userRole: UserRole,
  canAny: (permissions: PermissionCode[]) => boolean
): T[] {
  return items.filter((item) => hasSidebarItemAccess(item, userRole, canAny));
}
