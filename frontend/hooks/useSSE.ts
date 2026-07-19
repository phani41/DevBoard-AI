"use client";

import { useEffect, useRef, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";

type SSEEventHandler = (data: any) => void;

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/**
 * Establishes an SSE connection for a project and auto-refetches
 * TanStack Query data when relevant events arrive.
 *
 * Usage in a page/component:
 *   useSSE(projectId);
 *
 * The hook automatically invalidates query keys based on event type:
 *   - task_created  → ['tasks']
 *   - task_updated  → ['tasks']
 *   - task_deleted  → ['tasks']
 *   - comment_added → ['comments', taskId]
 *   - member_joined → ['projects', projectId]
 *   - member_removed → ['projects', projectId]
 *   - role_changed  → ['projects', projectId, 'roles']
 */
export function useSSE(projectId: number | undefined) {
  const queryClient = useQueryClient();
  const eventSourceRef = useRef<EventSource | null>(null);
  const handlersRef = useRef<Map<string, SSEEventHandler[]>>(new Map());

  const on = useCallback((event: string, handler: SSEEventHandler) => {
    if (!handlersRef.current.has(event)) {
      handlersRef.current.set(event, []);
    }
    handlersRef.current.get(event)!.push(handler);
    return () => {
      const handlers = handlersRef.current.get(event);
      if (handlers) {
        const idx = handlers.indexOf(handler);
        if (idx >= 0) handlers.splice(idx, 1);
      }
    };
  }, []);

  useEffect(() => {
    if (!projectId) return;

    const token = api.getToken();
    if (!token) return;

    const url = `${API_BASE}/api/events/project/${projectId}?token=${token}`;

    const es = new EventSource(url, {
      withCredentials: false,
    });
    eventSourceRef.current = es;

    es.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        const { event: eventType, data } = payload;

        // Call registered handlers
        const handlers = handlersRef.current.get(eventType) || [];
        handlers.forEach((fn) => fn(data));

        // Auto-invalidate TanStack Query keys based on event type
        switch (eventType) {
          case "task_created":
          case "task_updated":
          case "task_deleted":
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
            queryClient.invalidateQueries({ queryKey: ["task", data.task_id] });
            queryClient.invalidateQueries({ queryKey: ["activity"] });
            break;
          case "comment_added":
            queryClient.invalidateQueries({ queryKey: ["comments", data.task_id] });
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
            queryClient.invalidateQueries({ queryKey: ["activity"] });
            break;
          case "member_joined":
          case "member_removed":
            queryClient.invalidateQueries({ queryKey: ["project", projectId] });
            queryClient.invalidateQueries({ queryKey: ["projects"] });
            queryClient.invalidateQueries({ queryKey: ["project-members", projectId] });
            queryClient.invalidateQueries({ queryKey: ["activity"] });
            break;
          case "role_changed":
            queryClient.invalidateQueries({ queryKey: ["project", projectId] });
            queryClient.invalidateQueries({ queryKey: ["project-members", projectId] });
            queryClient.invalidateQueries({ queryKey: ["activity"] });
            break;
          case "file_uploaded":
            queryClient.invalidateQueries({ queryKey: ["attachments", data.task_id] });
            queryClient.invalidateQueries({ queryKey: ["activity"] });
            break;
          case "invitation_sent":
            queryClient.invalidateQueries({ queryKey: ["invitations"] });
            break;
        }
      } catch (e) {
        // Ignore malformed events (keepalive comments, etc.)
      }
    };

    es.onerror = () => {
      // EventSource auto-reconnects by default
    };

    return () => {
      es.close();
      eventSourceRef.current = null;
    };
  }, [projectId, queryClient]);

  return { on };
}
