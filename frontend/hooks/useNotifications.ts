import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { NotificationList } from "@/types";

export function useNotifications(params?: { page?: number; unread_only?: boolean }) {
  return useQuery<NotificationList>({
    queryKey: ["notifications", params],
    queryFn: () => api.getNotifications(params),
    refetchInterval: 30000, // Poll every 30 seconds
  });
}

export function useUnreadCount() {
  return useQuery<{ unread_count: number }>({
    queryKey: ["notifications", "unread-count"],
    queryFn: () => api.getUnreadCount(),
    refetchInterval: 15000, // Poll every 15 seconds
  });
}

export function useMarkNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: number[]) => api.markNotificationsRead(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications", "unread-count"] });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.markAllNotificationsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications", "unread-count"] });
    },
  });
}
