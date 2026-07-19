"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import { useAuth } from "@/hooks/useAuth";
import { can, ROLE_HIERARCHY } from "@/lib/permissions";
import { ProjectRole, ProjectMemberWithRole } from "@/types";

/**
 * Hook to get the current user's role in a specific project.
 * Also provides convenience permission-checking methods.
 *
 * @example
 *   const { role, canEdit, canDelete, canInvite } = useProjectRole(projectId);
 *   if (canEdit) { ... show edit button ... }
 */
export function useProjectRole(projectId: number | undefined) {
  const { user } = useAuth();

  const { data: members, isLoading } = useQuery<ProjectMemberWithRole[]>({
    queryKey: ["project-members", projectId],
    queryFn: () => api.getProjectMembersWithRoles(projectId!),
    enabled: !!projectId && !!user,
  });

  const currentMember = members?.find((m) => m.id === user?.id);
  const role: ProjectRole | undefined = currentMember?.role;

  return {
    role,
    isLoading,
    members: members || [],
    can: (permission: string) => can(role, permission),
    isOwner: role === "owner",
    isAdmin: role === "admin" || role === "owner",
    canEdit: can(role, "project:edit"),
    canDelete: can(role, "project:delete"),
    canInvite: can(role, "member:invite"),
    canRemoveMember: can(role, "member:remove"),
    canCreateTask: can(role, "task:create"),
    canEditAnyTask: can(role, "task:edit_any"),
    canEditOwnTask: can(role, "task:edit_own"),
    canDeleteAnyTask: can(role, "task:delete_any"),
    canDeleteOwnTask: can(role, "task:delete_own"),
    canReorder: can(role, "task:reorder"),
    canComment: can(role, "comment:create"),
    canManageRoles: can(role, "project:manage_roles"),
    canUseAI: can(role, "ai:use"),
    roleRank: role ? ROLE_HIERARCHY[role] ?? -1 : -1,
  } as const;
}
