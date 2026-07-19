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
export type ProjectRole = "owner" | "admin" | "member" | "viewer";

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
  user_role?: ProjectRole;
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

export interface ProjectMemberWithRole {
  id: number;
  email: string;
  username: string;
  full_name?: string;
  avatar_url?: string;
  role?: ProjectRole;
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

// Extended AI types
export interface SprintPlanRequest {
  project_name: string;
  project_description: string;
  tasks: string[];
  sprint_duration_days: number;
  team_size: number;
}

export interface SprintPlanResponse {
  sprint_name: string;
  duration: string;
  goals: string[];
  task_assignments: any[];
  milestones: string[];
  estimated_velocity: string;
  risks: string[];
}

export interface ProjectSummaryRequest {
  project_name: string;
  project_description: string;
  features: string[];
  stats?: any;
}

export interface ProjectSummaryResponse {
  summary: string;
  key_metrics: string[];
  health_score: string;
  recommendations: string[];
}

export interface RiskAnalysisRequest {
  project_name: string;
  project_description: string;
  tasks: string[];
  current_status?: string;
}

export interface RiskAnalysisResponse {
  risks: any[];
  overall_risk_level: string;
  mitigation_strategies: string[];
  critical_path_items: string[];
}

export interface TaskPrioritizationRequest {
  tasks: any[];
  criteria?: string;
}

export interface TaskPrioritizationResponse {
  prioritized_tasks: any[];
  rationale: string;
  recommended_first_actions: string[];
}

// Notification types
export interface Notification {
  id: number;
  user_id: number;
  type: string;
  title: string;
  message?: string;
  link?: string;
  is_read: boolean;
  metadata_json?: any;
  created_at: string;
}

export interface NotificationList {
  notifications: Notification[];
  unread_count: number;
  total: number;
}

// Activity types
export interface ActivityLog {
  id: number;
  user_id?: number;
  project_id?: number;
  task_id?: number;
  action: string;
  description?: string;
  metadata_json?: any;
  created_at: string;
  user_name?: string;
  user_avatar?: string;
}

export interface ActivityTimeline {
  activities: ActivityLog[];
  total: number;
  page: number;
  per_page: number;
}

// Invitation types
export interface Invitation {
  id: number;
  project_id: number;
  email: string;
  role: ProjectRole;
  token: string;
  expires_at: string;
  status: string;
  inviter_id: number;
  created_at: string;
  updated_at: string;
}

export interface InvitationPublic {
  id: number;
  project_id: number;
  project_name?: string;
  email: string;
  role: ProjectRole;
  inviter_name?: string;
  expires_at: string;
  status: string;
}

// Attachment types
export interface Attachment {
  id: number;
  task_id: number;
  user_id: number;
  filename: string;
  original_filename: string;
  content_type: string;
  file_size: number;
  storage_path: string;
  bucket: string;
  created_at: string;
  uploader_name?: string;
}

// Profile types
export interface UserProfile {
  id: number;
  user_id: number;
  bio?: string;
  timezone: string;
  avatar_storage_path?: string;
  notification_preferences: Record<string, boolean>;
  created_at: string;
  updated_at: string;
}

export interface UserProfileUpdate {
  bio?: string;
  timezone?: string;
  notification_preferences?: Record<string, boolean>;
}

// Search types
export interface SearchResult {
  id: number;
  type: string;
  title: string;
  description?: string;
  link: string;
  metadata?: any;
  score: number;
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
  page: number;
  per_page: number;
}

// Dashboard types
export interface ProductivityData {
  date: string;
  completed: number;
  created: number;
}
