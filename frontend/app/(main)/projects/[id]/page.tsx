"use client";

import { useState } from "react";
import { useProject, useUpdateProject, useDeleteProject } from "@/hooks/useProjects";
import { useTasks, useCreateTask, useUpdateTask } from "@/hooks/useTasks";
import { useProjectActivity } from "@/hooks/useActivity";
import { useAuth } from "@/hooks/useAuth";
import { useSSE } from "@/hooks/useSSE";
import { useProjectRole } from "@/hooks/useRBAC";
import { CardSkeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Calendar,
  Users,
  CheckSquare,
  Loader2,
  Clock,
  Activity,
  Settings,
  Shield,
  UserPlus,
  UserMinus,
  Crown,
  Star,
  User,
  Mail,
  Copy,
  Check,
  MoveRight,
  Bot,
} from "lucide-react";
import { Task, ActivityLog, ProjectMemberWithRole } from "@/types";
import { formatDate, getStatusColor, getStatusLabel, getInitials, formatRelativeTime } from "@/lib/utils";
import { toast } from "sonner";
import { api } from "@/services/api";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const ROLE_OPTIONS = [
  { value: "admin", label: "Admin", description: "Manage tasks, invite members, manage comments" },
  { value: "member", label: "Member", description: "Create tasks, comment, upload files" },
  { value: "viewer", label: "Viewer", description: "Read only access" },
];

interface TaskProgressProps {
  tasks: Task[];
}

function TaskProgress({ tasks }: TaskProgressProps) {
  if (!tasks || tasks.length === 0) return null;
  const total = tasks.length;
  const done = tasks.filter((t) => t.status === "done").length;
  const inProgress = tasks.filter((t) => t.status === "in_progress").length;
  const review = tasks.filter((t) => t.status === "review").length;
  const todo = tasks.filter((t) => t.status === "todo").length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center justify-between">
          <span>Task Progress</span>
          <span className="text-sm font-normal text-muted-foreground">{done}/{total} done ({pct}%)</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="h-3 bg-secondary rounded-full overflow-hidden flex">
          {done > 0 && <div className="h-full bg-green-500 transition-all" style={{ width: `${(done / total) * 100}%` }} />}
          {review > 0 && <div className="h-full bg-yellow-500 transition-all" style={{ width: `${(review / total) * 100}%` }} />}
          {inProgress > 0 && <div className="h-full bg-blue-500 transition-all" style={{ width: `${(inProgress / total) * 100}%` }} />}
          {todo > 0 && <div className="h-full bg-muted transition-all" style={{ width: `${(todo / total) * 100}%` }} />}
        </div>
        <div className="grid grid-cols-4 gap-2 text-center text-xs">
          <div><div className="w-2 h-2 rounded-full bg-green-500 mx-auto mb-1" />Done: {done}</div>
          <div><div className="w-2 h-2 rounded-full bg-yellow-500 mx-auto mb-1" />Review: {review}</div>
          <div><div className="w-2 h-2 rounded-full bg-blue-500 mx-auto mb-1" />In Progress: {inProgress}</div>
          <div><div className="w-2 h-2 rounded-full bg-muted mx-auto mb-1" />Todo: {todo}</div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const projectId = Number(params.id);
  const { user } = useAuth();

  const { data: project, isLoading: projectLoading } = useProject(projectId);
  const { data: tasks, isLoading: tasksLoading } = useTasks({ project_id: projectId });
  const { data: activityData } = useProjectActivity(projectId);
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();

  const [activeTab, setActiveTab] = useState("tasks");
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [memberDialogOpen, setMemberDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("member");
  const [membersLoading, setMembersLoading] = useState(false);
  const [members, setMembers] = useState<ProjectMemberWithRole[]>([]);
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [showEditName, setShowEditName] = useState(false);

  // SSE for real-time updates
  useSSE(projectId);

  // Fetch members with roles
  const fetchMembers = async () => {
    try {
      const data = await api.getProjectMembersWithRoles(projectId);
      setMembers(data);
    } catch {
      // Silently fail
    }
  };

  // Fetch members when tab changes to members
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === "members") {
      fetchMembers();
    }
  };

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this project?")) {
      await deleteProject.mutateAsync(projectId);
      router.push("/projects");
    }
  };

  const handleCreateTask = async () => {
    if (!newTaskTitle.trim()) return;
    try {
      await createTask.mutateAsync({
        title: newTaskTitle,
        project_id: projectId,
        status: "todo",
      });
      setNewTaskTitle("");
      setTaskDialogOpen(false);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;
    setMembersLoading(true);
    try {
      await api.createInvitations(projectId, [{ email: inviteEmail, role: inviteRole }]);
      toast.success(`Invitation sent to ${inviteEmail}`);
      setInviteEmail("");
      setMemberDialogOpen(false);
      fetchMembers();
    } catch (err: any) {
      toast.error(err.message);
    }
    setMembersLoading(false);
  };

  const handleRemoveMember = async (userId: number, username: string) => {
    if (confirm(`Remove ${username} from this project?`)) {
      try {
        await api.removeProjectMember(projectId, userId);
        toast.success(`${username} removed from project`);
        fetchMembers();
        queryClient.invalidateQueries({ queryKey: ["project", projectId] });
      } catch (err: any) {
        toast.error(err.message);
      }
    }
  };

  const handleRoleChange = async (userId: number, role: string) => {
    try {
      await api.updateMemberRoles(projectId, [{ user_id: userId, role }]);
      toast.success("Role updated");
      fetchMembers();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleCopyInviteLink = async () => {
    try {
      const pendingInvites = await api.getPendingInvitations(projectId);
      if (pendingInvites.length > 0) {
        const token = pendingInvites[0].token;
        const link = `${window.location.origin}/accept-invitation?token=${token}`;
        await navigator.clipboard.writeText(link);
        setCopiedEmail("link");
        setTimeout(() => setCopiedEmail(null), 2000);
        toast.success("Invite link copied!");
      } else {
        toast.error("No pending invitations. Send an invite first.");
      }
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleSaveName = async () => {
    if (!editName.trim()) return;
    try {
      await updateProject.mutateAsync({ id: projectId, data: { name: editName } });
      setShowEditName(false);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleSaveDescription = async (description: string) => {
    try {
      await updateProject.mutateAsync({ id: projectId, data: { description } });
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  if (projectLoading) return <CardSkeleton />;
  if (!project) return <div className="flex items-center justify-center h-96 text-muted-foreground">Project not found</div>;

  const { role: myRole, canInvite, canCreateTask, canEdit, canDelete, canRemoveMember, canManageRoles } = useProjectRole(projectId);
  const isOwner = project.owner_id === user?.id;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/projects")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              {showEditName ? (
                <div className="flex items-center gap-2">
                  <Input value={editName} onChange={(e) => setEditName(e.target.value)}
                    className="text-xl font-bold h-10 w-64" autoFocus
                    onKeyDown={(e) => e.key === "Enter" && handleSaveName()} />
                  <Button size="sm" onClick={handleSaveName}><Check className="h-4 w-4" /></Button>
                  <Button size="sm" variant="ghost" onClick={() => setShowEditName(false)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              ) : (
                <h1 className="text-2xl font-bold" onClick={() => { if (isOwner) { setEditName(project.name); setShowEditName(true); } }}>
                  {project.name}
                </h1>
              )}
              <Badge variant={project.status === "active" ? "success" : "secondary"} className="capitalize">{project.status}</Badge>
              {myRole && <Badge variant="outline" className="text-[10px]"><Crown className={`h-3 w-3 mr-1 ${myRole === 'owner' || myRole === 'admin' ? 'text-yellow-500' : ''}`} />{myRole}</Badge>}
            </div>
            <p className="text-muted-foreground mt-1 text-sm">{project.description || "No description"}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {canDelete && (
            <Button variant="destructive" size="sm" onClick={handleDelete} className="gap-2">
              <Trash2 className="h-4 w-4" /> Delete
            </Button>
          )}
        </div>
      </div>

      {/* Project Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <Card><CardContent className="flex items-center gap-3 p-4">
          <Calendar className="h-5 w-5 text-muted-foreground" />
          <div><p className="text-xs text-muted-foreground">Created</p><p className="text-sm font-medium">{formatDate(project.created_at)}</p></div>
        </CardContent></Card>
        <Card><CardContent className="flex items-center gap-3 p-4">
          <Users className="h-5 w-5 text-muted-foreground" />
          <div><p className="text-xs text-muted-foreground">Members</p><p className="text-sm font-medium">{project.members?.length || 1}</p></div>
        </CardContent></Card>
        <Card><CardContent className="flex items-center gap-3 p-4">
          <CheckSquare className="h-5 w-5 text-muted-foreground" />
          <div><p className="text-xs text-muted-foreground">Tasks</p><p className="text-sm font-medium">{project.task_count || 0}</p></div>
        </CardContent></Card>
        <Card><CardContent className="flex items-center gap-3 p-4">
          <Activity className="h-5 w-5 text-muted-foreground" />
          <div><p className="text-xs text-muted-foreground">Activity</p><p className="text-sm font-medium">{activityData?.total || 0} events</p></div>
        </CardContent></Card>
      </div>

      {/* Task Progress Bar */}
      {tasks && tasks.length > 0 && <TaskProgress tasks={tasks} />}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="grid grid-cols-4 w-full max-w-lg">
          <TabsTrigger value="tasks" className="gap-2"><CheckSquare className="h-4 w-4" />Tasks</TabsTrigger>
          <TabsTrigger value="members" className="gap-2"><Users className="h-4 w-4" />Members</TabsTrigger>
          <TabsTrigger value="activity" className="gap-2"><Activity className="h-4 w-4" />Activity</TabsTrigger>
          <TabsTrigger value="settings" className="gap-2"><Settings className="h-4 w-4" />Settings</TabsTrigger>
        </TabsList>

        {/* ── Tasks Tab ── */}
        <TabsContent value="tasks" className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">All Tasks</h2>
            {canCreateTask && (
              <Dialog open={taskDialogOpen} onOpenChange={setTaskDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2"><Plus className="h-4 w-4" /> Add Task</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Create Task</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <Input value={newTaskTitle} onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="Enter task title" onKeyDown={(e) => e.key === "Enter" && handleCreateTask()} />
                  <Button onClick={handleCreateTask} className="w-full">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Create Task
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {tasksLoading ? (
            <div className="space-y-3">{[1,2,3].map((i) => <div key={i} className="h-16 bg-secondary rounded-lg animate-pulse" />)}</div>
          ) : tasks && tasks.length > 0 ? (
            <div className="space-y-2">
              {tasks.map((task: Task) => (
                <Link key={task.id} href={`/tasks/${task.id}`}
                  className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(task.status)}`} />
                    <div>
                      <p className="text-sm font-medium group-hover:text-primary transition-colors">{task.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant={task.priority === "urgent" ? "destructive" : task.priority === "high" ? "warning" : "secondary"} className="text-[10px] px-1.5 py-0 capitalize">{task.priority}</Badge>
                        <span className="text-xs text-muted-foreground">{getStatusLabel(task.status)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    {task.due_date && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{formatDate(task.due_date)}</span>}
                    {task.assignee && <span className="flex items-center gap-1"><User className="h-3 w-3" />{task.assignee.username}</span>}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <CheckSquare className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">No tasks in this project yet</p>
            </div>
          )}
        </TabsContent>

        {/* ── Members Tab ── */}
        <TabsContent value="members" className="mt-6 space-y-4">            <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Team Members</h2>
            <div className="flex items-center gap-2">
              {canInvite && (
                <>
              <Button variant="outline" size="sm" onClick={handleCopyInviteLink} className="gap-2">
                {copiedEmail === "link" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                Copy Invite Link
              </Button>
              <Dialog open={memberDialogOpen} onOpenChange={setMemberDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-2"><UserPlus className="h-4 w-4" /> Invite</Button>
                </DialogTrigger>
                </>
              )}
                <DialogContent>
                  <DialogHeader><DialogTitle>Invite Member</DialogTitle></DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Email</label>
                      <Input value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} type="email" placeholder="colleague@company.com" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Role</label>
                      <Select value={inviteRole} onValueChange={setInviteRole}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {ROLE_OPTIONS.map((r) => (
                            <SelectItem key={r.value} value={r.value}>
                              <div><p className="capitalize">{r.label}</p><p className="text-xs text-muted-foreground">{r.description}</p></div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button onClick={handleInvite} disabled={membersLoading || !inviteEmail.trim()} className="w-full gap-2">
                      {membersLoading ? <><Loader2 className="h-4 w-4 animate-spin" /> Sending...</> : <><Mail className="h-4 w-4" /> Send Invitation</>}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <Card>
            <CardContent className="p-0 divide-y divide-border">
              {members.length === 0 ? (
                <div className="p-6 text-center text-sm text-muted-foreground">Loading members...</div>
              ) : (
                members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="text-xs">{getInitials(member.full_name || member.username)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium">{member.full_name || member.username}</p>
                          {member.id === project.owner_id && <Crown className="h-3 w-3 text-yellow-500" />}
                          {member.id === user?.id && <span className="text-[10px] text-muted-foreground">(you)</span>}
                        </div>
                        <p className="text-xs text-muted-foreground">{member.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {member.id === project.owner_id ? (
                        <Badge variant="default" className="text-[10px]">Owner</Badge>
                      ) : (
                        <Select
                          value={member.role || "viewer"}
                          onValueChange={(role) => handleRoleChange(member.id, role)}
                          disabled={!isOwner}
                        >
                          <SelectTrigger className="h-7 w-24 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="member">Member</SelectItem>
                            <SelectItem value="viewer">Viewer</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                      {isOwner && member.id !== project.owner_id && (
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleRemoveMember(member.id, member.username)}>
                          <UserMinus className="h-3 w-3 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Activity Tab ── */}
        <TabsContent value="activity" className="mt-6 space-y-4">
          <h2 className="text-lg font-semibold">Recent Activity</h2>
          {activityData && activityData.activities.length > 0 ? (
            <div className="space-y-3">
              {activityData.activities.slice(0, 15).map((a: ActivityLog) => (
                <div key={a.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-secondary/30 transition-colors">
                  <Avatar className="h-7 w-7 shrink-0">
                    <AvatarFallback className="text-[9px]">{a.user_name ? getInitials(a.user_name) : "S"}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">{a.description || a.action.replace(/_/g, " ")}</p>
                    <p className="text-[10px] text-muted-foreground/60 mt-0.5">{formatRelativeTime(a.created_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Activity className="h-8 w-8 text-muted-foreground/40 mb-2" />
              <p className="text-sm text-muted-foreground">No activity yet</p>
            </div>
          )}
          <Link href={`/activity`}>
            <Button variant="ghost" size="sm" className="gap-2"><MoveRight className="h-3 w-3" /> View Full Timeline</Button>
          </Link>
        </TabsContent>

        {/* ── Settings Tab ── */}
        <TabsContent value="settings" className="mt-6 space-y-4">
          <h2 className="text-lg font-semibold">Project Settings</h2>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Edit Project</CardTitle>
              <CardDescription>Update project name and description</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Project Name</label>
                <Input
                  defaultValue={project.name}
                  onBlur={(e) => {
                    if (e.target.value !== project.name) {
                      updateProject.mutate({ id: projectId, data: { name: e.target.value } });
                    }
                  }}
                  className="max-w-md" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <textarea
                  defaultValue={project.description || ""}
                  onBlur={(e) => {
                    if (e.target.value !== (project.description || "")) {
                      updateProject.mutate({ id: projectId, data: { description: e.target.value } });
                    }
                  }}
                  className="flex min-h-[80px] w-full max-w-md rounded-lg border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="h-4 w-4" />
                <span>You are the <strong>Owner</strong> of this project</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
