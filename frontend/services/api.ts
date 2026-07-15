const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface FetchOptions extends RequestInit {
  skipAuth?: boolean;
}

class ApiService {
  private token: string | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("devboard_token");
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== "undefined") {
      if (token) {
        localStorage.setItem("devboard_token", token);
        // Also set a cookie for middleware (expires in 24h)
        document.cookie = `devboard_token=${token};path=/;max-age=86400;samesite=lax`;
      } else {
        localStorage.removeItem("devboard_token");
        document.cookie = "devboard_token=;path=/;max-age=0";
      }
    }
  }

  getToken(): string | null {
    return this.token;
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  private async request<T>(
    endpoint: string,
    options: FetchOptions = {}
  ): Promise<T> {
    const { skipAuth = false, ...fetchOptions } = options;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(fetchOptions.headers as Record<string, string>),
    };

    if (!skipAuth && this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...fetchOptions,
      headers,
    });

    if (response.status === 204) {
      return {} as T;
    }

    const data = await response.json();

    if (!response.ok) {
      const error = data.detail || data.message || "Something went wrong";
      throw new Error(error);
    }

    return data as T;
  }

  // Auth
  async login(email: string, password: string) {
    const data = await this.request<{
      access_token: string;
      token_type: string;
      user: any;
    }>(
      "/api/login",
      {
        method: "POST",
        body: JSON.stringify({ email, password }),
        skipAuth: true,
      }
    );
    this.setToken(data.access_token);
    return data;
  }

  async register(email: string, username: string, password: string, full_name?: string) {
    const data = await this.request<{
      access_token: string;
      token_type: string;
      user: any;
    }>(
      "/api/register",
      {
        method: "POST",
        body: JSON.stringify({ email, username, password, full_name }),
        skipAuth: true,
      }
    );
    this.setToken(data.access_token);
    return data;
  }

  async getMe() {
    return this.request<any>("/api/me");
  }

  logout() {
    this.setToken(null);
  }

  // Projects
  async getProjects() {
    return this.request<any[]>("/api/projects");
  }

  async getProject(id: number) {
    return this.request<any>(`/api/projects/${id}`);
  }

  async createProject(data: any) {
    return this.request<any>("/api/projects", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateProject(id: number, data: any) {
    return this.request<any>(`/api/projects/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteProject(id: number) {
    return this.request<void>(`/api/projects/${id}`, {
      method: "DELETE",
    });
  }

  async addProjectMember(projectId: number, userId: number) {
    return this.request<any>(`/api/projects/${projectId}/members`, {
      method: "POST",
      body: JSON.stringify({ user_id: userId }),
    });
  }

  async removeProjectMember(projectId: number, userId: number) {
    return this.request<any>(`/api/projects/${projectId}/members/${userId}`, {
      method: "DELETE",
    });
  }

  // Tasks
  async getTasks(params?: {
    project_id?: number;
    status?: string;
    priority?: string;
    assignee_id?: number;
  }) {
    const query = new URLSearchParams();
    if (params?.project_id) query.set("project_id", String(params.project_id));
    if (params?.status) query.set("status", params.status);
    if (params?.priority) query.set("priority", params.priority);
    if (params?.assignee_id) query.set("assignee_id", String(params.assignee_id));
    const qs = query.toString();
    return this.request<any[]>(`/api/tasks${qs ? `?${qs}` : ""}`);
  }

  async getTask(id: number) {
    return this.request<any>(`/api/tasks/${id}`);
  }

  async createTask(data: any) {
    return this.request<any>("/api/tasks", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateTask(id: number, data: any) {
    return this.request<any>(`/api/tasks/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteTask(id: number) {
    return this.request<void>(`/api/tasks/${id}`, {
      method: "DELETE",
    });
  }

  async reorderTask(taskId: number, status: string, position: number) {
    return this.request<any>(`/api/tasks/${taskId}/reorder`, {
      method: "PUT",
      body: JSON.stringify({ task_id: taskId, status, position }),
    });
  }

  // Comments
  async getComments(taskId: number) {
    return this.request<any[]>(`/api/tasks/${taskId}/comments`);
  }

  async createComment(taskId: number, content: string) {
    return this.request<any>(`/api/tasks/${taskId}/comments`, {
      method: "POST",
      body: JSON.stringify({ content, task_id: taskId }),
    });
  }

  // AI
  async taskBreakdown(taskTitle: string, description?: string) {
    return this.request<any>("/api/ai/task-breakdown", {
      method: "POST",
      body: JSON.stringify({ task_title: taskTitle, description }),
    });
  }

  async explainBug(errorMessage: string, codeContext?: string) {
    return this.request<any>("/api/ai/bug-explain", {
      method: "POST",
      body: JSON.stringify({ error_message: errorMessage, code_context: codeContext }),
    });
  }

  async generateDocumentation(data: {
    project_name: string;
    description: string;
    features: string[];
    doc_type: string;
  }) {
    return this.request<any>("/api/ai/documentation", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getAIHistory() {
    return this.request<any[]>("/api/ai/history");
  }

  // Password Reset
  async forgotPassword(email: string) {
    return this.request<{ message: string }>(
      "/api/forgot-password",
      {
        method: "POST",
        body: JSON.stringify({ email }),
        skipAuth: true,
      }
    );
  }

  async resetPassword(token: string, password: string) {
    return this.request<{ message: string }>(
      "/api/reset-password",
      {
        method: "POST",
        body: JSON.stringify({ token, password }),
        skipAuth: true,
      }
    );
  }
}

export const api = new ApiService();
