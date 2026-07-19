import { ProjectRole } from "@/types";

/**
 * Role hierarchy — higher index = more permissions
 */
export const ROLE_HIERARCHY: Record<ProjectRole, number> = {
  viewer: 0,
  member: 1,
  admin: 2,
  owner: 3,
};

/**
 * Permission definitions — maps permission keys to allowed roles.
 * Mirrors the backend RBACService.PERMISSIONS.
 */
export const PERMISSIONS: Record<string, ProjectRole[]> = {
  "project:view": ["viewer", "member", "admin", "owner"],
  "project:edit": ["admin", "owner"],
  "project:delete": ["owner"],
  "project:manage_roles": ["owner"],
  "project:transfer_ownership": ["owner"],
  "task:create": ["member", "admin", "owner"],
  "task:edit_any": ["admin", "owner"],
  "task:edit_own": ["member", "admin", "owner"],
  "task:delete_any": ["admin", "owner"],
  "task:delete_own": ["member", "admin", "owner"],
  "task:reorder": ["member", "admin", "owner"],
  "member:invite": ["admin", "owner"],
  "member:remove": ["admin", "owner"],
  "member:view": ["viewer", "member", "admin", "owner"],
  "comment:create": ["member", "admin", "owner"],
  "comment:delete_any": ["admin", "owner"],
  "comment:delete_own": ["member", "admin", "owner"],
  "ai:use": ["member", "admin", "owner"],
};

/**
 * Check if a role has a specific permission.
 *
 * @example
 *   can("owner", "project:delete")        // true
 *   can("viewer", "task:create")          // false
 *   can("member", "task:edit_own")         // true
 *   can("member", "member:invite")         // false
 */
export function can(role: ProjectRole | undefined | null, permission: string): boolean {
  if (!role) return false;
  const allowedRoles = PERMISSIONS[permission];
  if (!allowedRoles) return false;
  const roleRank = ROLE_HIERARCHY[role] ?? -1;
  return allowedRoles.some((allowed) => ROLE_HIERARCHY[allowed] <= roleRank);
}

/**
 * Get the role badge variant for display.
 */
export function getRoleBadgeVariant(role: ProjectRole): "default" | "secondary" | "outline" | "info" {
  switch (role) {
    case "owner": return "default";
    case "admin": return "info";
    case "member": return "secondary";
    case "viewer": return "outline";
  }
}

/**
 * Get human-readable role label.
 */
export function getRoleLabel(role: ProjectRole): string {
  switch (role) {
    case "owner": return "Owner";
    case "admin": return "Admin";
    case "member": return "Member";
    case "viewer": return "Viewer";
  }
}

/**
 * Get role description for tooltips/help text.
 */
export function getRoleDescription(role: ProjectRole): string {
  switch (role) {
    case "owner":
      return "Full control — delete project, manage members, change roles, invite users";
    case "admin":
      return "Manage tasks, invite members, manage comments and files";
    case "member":
      return "Create tasks, edit assigned tasks, comment, upload files";
    case "viewer":
      return "Read-only access to projects and tasks";
  }
}

/**
 * All available role options for select dropdowns (excludes owner from direct assignment).
 */
export const ROLE_OPTIONS = [
  { value: "admin" as ProjectRole, label: "Admin", description: "Manage tasks, invite members, manage comments" },
  { value: "member" as ProjectRole, label: "Member", description: "Create tasks, comment, upload files" },
  { value: "viewer" as ProjectRole, label: "Viewer", description: "Read only access" },
];
