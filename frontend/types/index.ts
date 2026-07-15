// User types
export interface User {
  id: number;
  email: string;
  username: string;
  full_name?: string;
  avatar_url?: string;
  is_active: boolean;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  username: string;
  password: string;
  full_name?: string;
}

// Project types
export interface Project {
  id: number;
  name: string;
  description?: string;
  status: string;
  deadline?: string;
  owner_id: number;
  owner?: User;
  members: User[];
  task_count?: number;
  created_at: string;
  updated_at: string;
}

export interface ProjectCreate {
  name: string;
  description?: string;
  status?: string;
  deadline?: string;
}

export interface ProjectUpdate {
  name?: string;
  description?: string;
  status?: string;
  deadline?: string;
}

// Task types
export interface ChecklistItem {
  text: string;
  completed: boolean;
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  priority: string;
  status: string;
  due_date?: string;
  assignee_id?: number;
  assignee?: { id: number; username: string; email: string; avatar_url?: string };
  project_id: number;
  labels: string[];
  checklist: ChecklistItem[];
  position: number;
  comment_count?: number;
  created_at: string;
  updated_at: string;
}

export interface TaskCreate {
  title: string;
  description?: string;
  priority?: string;
  status?: string;
  due_date?: string;
  assignee_id?: number;
  project_id: number;
  labels?: string[];
  checklist?: ChecklistItem[];
}

export interface TaskUpdate {
  title?: string;
  description?: string;
  priority?: string;
  status?: string;
  due_date?: string;
  assignee_id?: number;
  labels?: string[];
  checklist?: ChecklistItem[];
  position?: number;
}

export interface TaskReorder {
  task_id: number;
  status: string;
  position: number;
}

// Comment types
export interface Comment {
  id: number;
  content: string;
  author_id: number;
  author_name?: string;
  author_avatar?: string;
  task_id: number;
  created_at: string;
  updated_at: string;
}

export interface CommentCreate {
  content: string;
  task_id: number;
}

// AI types
export interface TaskBreakdownRequest {
  task_title: string;
  description?: string;
}

export interface TaskBreakdownResponse {
  subtasks: string[];
  explanation: string;
}

export interface BugExplainRequest {
  error_message: string;
  code_context?: string;
}

export interface BugExplainResponse {
  problem: string;
  root_cause: string;
  solution: string;
}

export interface DocumentationRequest {
  project_name: string;
  description: string;
  features: string[];
  doc_type: string;
}

export interface DocumentationResponse {
  content: string;
  doc_type: string;
}

export interface AIHistory {
  id: number;
  feature_type: string;
  input_text: string;
  output_text: string;
  metadata_json?: any;
  created_at: string;
}

// Dashboard types
export interface DashboardStats {
  active_projects: number;
  assigned_tasks: number;
  tasks_due_today: number;
  completed_tasks: number;
  recent_activity: ActivityItem[];
  productivity_data: ProductivityData[];
}

export interface ActivityItem {
  id: number;
  type: string;
  message: string;
  user_name: string;
  created_at: string;
}

export interface ProductivityData {
  date: string;
  completed: number;
  created: number;
}
