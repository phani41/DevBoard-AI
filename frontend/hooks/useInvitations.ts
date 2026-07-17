import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { Invitation, InvitationPublic } from "@/types";
import { toast } from "sonner";

export function useMyInvitations() {
  return useQuery<InvitationPublic[]>({
    queryKey: ["invitations", "mine"],
    queryFn: () => api.getMyInvitations(),
    refetchInterval: 60000,
  });
}

export function usePendingInvitations(projectId: number | undefined) {
  return useQuery<Invitation[]>({
    queryKey: ["invitations", "pending", projectId],
    queryFn: () => api.getPendingInvitations(projectId!),
    enabled: !!projectId,
  });
}

export function useCreateInvitations() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, invitations }: { projectId: number; invitations: { email: string; role: string }[] }) =>
      api.createInvitations(projectId, invitations),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invitations"] });
      toast.success("Invitations sent successfully");
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useCancelInvitation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (invitationId: number) => api.cancelInvitation(invitationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invitations"] });
      toast.success("Invitation cancelled");
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useResendInvitation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (invitationId: number) => api.resendInvitation(invitationId),
    onSuccess: () => toast.success("Invitation resent"),
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useAcceptInvitation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (token: string) => api.acceptInvitation(token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invitations"] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Invitation accepted! You've joined the project.");
    },
    onError: (error: Error) => toast.error(error.message),
  });
}
