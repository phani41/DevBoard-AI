import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import { ActivityTimeline } from "@/types";

export function useProjectActivity(projectId: number | undefined, page: number = 1) {
  return useQuery<ActivityTimeline>({
    queryKey: ["activity", "project", projectId, page],
    queryFn: () => api.getProjectActivity(projectId!, page),
    enabled: !!projectId,
  });
}

export function useGlobalActivity(page: number = 1) {
  return useQuery<ActivityTimeline>({
    queryKey: ["activity", "global", page],
    queryFn: () => api.getGlobalActivity(page),
  });
}

export function useUserActivity(page: number = 1) {
  return useQuery<ActivityTimeline>({
    queryKey: ["activity", "user", page],
    queryFn: () => api.getUserActivity(page),
  });
}
