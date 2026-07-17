import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import { SearchResponse } from "@/types";

export function useGlobalSearch(params: {
  q: string;
  project_id?: number;
  status?: string;
  priority?: string;
  type?: string;
  page?: number;
}) {
  return useQuery<SearchResponse>({
    queryKey: ["search", params],
    queryFn: () => api.globalSearch(params),
    enabled: params.q.length > 0,
  });
}
