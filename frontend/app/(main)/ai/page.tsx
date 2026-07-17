"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { api } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Brain,
  Bug,
  FileText,
  ListTree,
  Loader2,
  Sparkles,
  Copy,
  Check,
  Target,
  LineChart,
  AlertTriangle,
  TrendingUp,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { toast } from "sonner";
import { useProjects } from "@/hooks/useProjects";
import { useTasks } from "@/hooks/useTasks";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AIPage() {
  const [activeTab, setActiveTab] = useState("breakdown");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const { data: projects } = useProjects();
  const { data: tasks } = useTasks();

  const { register: regBreakdown, handleSubmit: handleBreakdown } = useForm();
  const { register: regBug, handleSubmit: handleBug } = useForm();
  const { register: regDocs, handleSubmit: handleDocsForm } = useForm();

  // New AI features
  const { register: regSprint, handleSubmit: handleSprint, reset: resetSprint } = useForm();
  const { register: regSummary, handleSubmit: handleSummary, reset: resetSummary } = useForm();
  const { register: regRisk, handleSubmit: handleRisk, reset: resetRisk } = useForm();
  const { register: regPriority, handleSubmit: handlePriority, reset: resetPriority } = useForm();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApiCall = async (fn: () => Promise<any>) => {
    setLoading(true);
    setResult(null);
    try {
      const res = await fn();
      setResult(res);
    } catch (err: any) {
      toast.error(err.message);
    }
    setLoading(false);
  };

  const handleTaskBreakdown = async (data: any) => {
    handleApiCall(() => api.taskBreakdown(data.task_title, data.description));
  };

  const handleBugExplain = async (data: any) => {
    handleApiCall(() => api.explainBug(data.error_message, data.code_context));
  };

  const handleDocs = async (data: any) => {
    const features = data.features.split(",").map((f: string) => f.trim());
    handleApiCall(() => api.generateDocumentation({
      project_name: data.project_name,
      description: data.description,
      features,
      doc_type: data.doc_type || "readme",
    }));
  };

  const handleSprintPlan = async (data: any) => {
    const taskTitles = tasks?.filter((t: any) => t.project_id === Number(data.project_id)).map((t: any) => t.title) || [];
    const project = projects?.find((p: any) => p.id === Number(data.project_id));
    handleApiCall(() => api.sprintPlan({
      project_name: project?.name || data.project_name,
      project_description: project?.description || data.project_description,
      tasks: data.custom_tasks ? data.custom_tasks.split(",").map((t: string) => t.trim()) : taskTitles,
      sprint_duration_days: Number(data.sprint_duration_days) || 14,
      team_size: Number(data.team_size) || 3,
    }));
  };

  const handleProjectSummary = async (data: any) => {
    const project = projects?.find((p: any) => p.id === Number(data.project_id));
    const projectTasks = tasks?.filter((t: any) => t.project_id === Number(data.project_id)) || [];
    const stats = {
      total_tasks: projectTasks.length,
      completed: projectTasks.filter((t: any) => t.status === "done").length,
      in_progress: projectTasks.filter((t: any) => t.status === "in_progress").length,
    };
    handleApiCall(() => api.projectSummary({
      project_name: project?.name || data.project_name,
      project_description: project?.description || data.project_description,
      features: data.features ? data.features.split(",").map((f: string) => f.trim()) : ["Core features"],
      stats,
    }));
  };

  const handleRiskAnalysis = async (data: any) => {
    const projectTasks = tasks?.filter((t: any) => t.project_id === Number(data.project_id)) || [];
    const taskTitles = projectTasks.map((t: any) => `${t.title} (${t.status}, ${t.priority})`);
    const project = projects?.find((p: any) => p.id === Number(data.project_id));
    handleApiCall(() => api.riskAnalysis({
      project_name: project?.name || data.project_name,
      project_description: project?.description || data.project_description,
      tasks: taskTitles,
      current_status: project?.status || "active",
    }));
  };

  const handleTaskPrioritization = async (data: any) => {
    const projectTasks = tasks?.filter((t: any) => {
      if (data.project_id && t.project_id !== Number(data.project_id)) return false;
      return true;
    }) || [];
    handleApiCall(() => api.taskPrioritization({
      tasks: projectTasks.map((t: any) => ({
        title: t.title,
        priority: t.priority,
        status: t.status,
        due_date: t.due_date,
        labels: t.labels,
      })),
      criteria: data.criteria || "urgency and importance",
    }));
  };

  const AIFeatureCard = ({ title, description, icon: Icon, color }: { title: string; description: string; icon: any; color: string }) => (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50">
      <div className={`p-2 rounded-lg ${color}`}>
        <Icon className="h-4 w-4 text-white" />
      </div>
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl gradient-primary">
          <Brain className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">AI Features</h1>
          <p className="text-muted-foreground mt-1">Powered by OpenRouter AI — 8 tools to supercharge your workflow</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="breakdown" className="gap-1.5"><ListTree className="h-3.5 w-3.5" />Breakdown</TabsTrigger>
          <TabsTrigger value="bug" className="gap-1.5"><Bug className="h-3.5 w-3.5" />Bug Fix</TabsTrigger>
          <TabsTrigger value="docs" className="gap-1.5"><FileText className="h-3.5 w-3.5" />Docs</TabsTrigger>
          <TabsTrigger value="sprint" className="gap-1.5"><Target className="h-3.5 w-3.5" />Sprint</TabsTrigger>
          <TabsTrigger value="summary" className="gap-1.5"><LineChart className="h-3.5 w-3.5" />Summary</TabsTrigger>
          <TabsTrigger value="risk" className="gap-1.5"><AlertTriangle className="h-3.5 w-3.5" />Risk</TabsTrigger>
          <TabsTrigger value="priority" className="gap-1.5"><TrendingUp className="h-3.5 w-3.5" />Prioritize</TabsTrigger>
        </TabsList>

        {/* Task Breakdown */}
        <TabsContent value="breakdown">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base"><Sparkles className="h-5 w-5 text-primary" />AI Task Breakdown</CardTitle>
                <CardDescription>Enter a task and let AI break it down into actionable subtasks.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleBreakdown(handleTaskBreakdown)} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Task Title</label>
                    <Input {...regBreakdown("task_title", { required: true })} placeholder="e.g., Build Authentication" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Description (optional)</label>
                    <textarea {...regBreakdown("description")} placeholder="Describe the task in more detail..." className="flex min-h-[100px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
                  </div>
                  <Button type="submit" className="w-full gap-2" disabled={loading}>
                    {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Analyzing...</> : <><Sparkles className="h-4 w-4" /> Break Down Task</>}
                  </Button>
                </form>
              </CardContent>
            </Card>
            {result && result.subtasks && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center justify-between">
                    <span>Subtasks ({result.subtasks.length})</span>
                    <Button variant="ghost" size="icon" onClick={() => copyToClipboard(result.subtasks.join("\n"))}>
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ol className="space-y-2 list-decimal list-inside">
                    {result.subtasks.map((subtask: string, i: number) => (
                      <li key={i} className="text-sm text-muted-foreground">{subtask}</li>
                    ))}
                  </ol>
                  {result.explanation && (
                    <div className="mt-4 p-3 rounded-lg bg-secondary/50">
                      <p className="text-xs text-muted-foreground">{result.explanation}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Bug Explain */}
        <TabsContent value="bug">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base"><Bug className="h-5 w-5 text-primary" />AI Bug Explainer</CardTitle>
                <CardDescription>Paste an error and get root cause analysis + solution.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleBug(handleBugExplain)} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Error Message</label>
                    <textarea {...regBug("error_message", { required: true })} placeholder="Paste the error message..." className="flex min-h-[100px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Code Context (optional)</label>
                    <textarea {...regBug("code_context")} placeholder="Paste relevant code..." className="flex min-h-[100px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
                  </div>
                  <Button type="submit" className="w-full gap-2" disabled={loading}>
                    {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Analyzing...</> : <><Bug className="h-4 w-4" /> Explain Bug</>}
                  </Button>
                </form>
              </CardContent>
            </Card>
            {result && result.problem && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center justify-between">
                    <span>Analysis</span>
                    <Button variant="ghost" size="icon" onClick={() => copyToClipboard(JSON.stringify(result, null, 2))}>
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1"><Bug className="h-4 w-4 text-red-500" /><span className="text-xs font-semibold uppercase text-red-500">Problem</span></div>
                    <p className="text-sm text-muted-foreground">{result.problem}</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1"><AlertTriangle className="h-4 w-4 text-yellow-500" /><span className="text-xs font-semibold uppercase text-yellow-500">Root Cause</span></div>
                    <p className="text-sm text-muted-foreground">{result.root_cause}</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1"><Sparkles className="h-4 w-4 text-green-500" /><span className="text-xs font-semibold uppercase text-green-500">Solution</span></div>
                    <p className="text-sm text-muted-foreground">{result.solution}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Documentation */}
        <TabsContent value="docs">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base"><FileText className="h-5 w-5 text-primary" />AI Documentation Generator</CardTitle>
                <CardDescription>Generate README, API docs, or release notes.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleDocsForm(handleDocs)} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Project Name</label>
                    <Input {...regDocs("project_name", { required: true })} placeholder="My Project" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Description</label>
                    <textarea {...regDocs("description", { required: true })} placeholder="Describe your project..." className="flex min-h-[80px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Features (comma separated)</label>
                    <Input {...regDocs("features", { required: true })} placeholder="Auth, API, Dashboard, etc." />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Documentation Type</label>
                    <select {...regDocs("doc_type")} className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
                      <option value="readme">README</option>
                      <option value="api">API Documentation</option>
                      <option value="release">Release Notes</option>
                    </select>
                  </div>
                  <Button type="submit" className="w-full gap-2" disabled={loading}>
                    {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Generating...</> : <><FileText className="h-4 w-4" /> Generate Docs</>}
                  </Button>
                </form>
              </CardContent>
            </Card>
            {result && result.content && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center justify-between">
                    <Badge variant="info" className="capitalize">{result.doc_type}</Badge>
                    <Button variant="ghost" size="icon" onClick={() => copyToClipboard(result.content)}>
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="whitespace-pre-wrap text-sm text-muted-foreground max-h-[400px] overflow-y-auto">{result.content}</pre>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Sprint Planner */}
        <TabsContent value="sprint">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base"><Target className="h-5 w-5 text-primary" />AI Sprint Planner</CardTitle>
                <CardDescription>Generate a sprint plan from your project tasks.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSprint(handleSprintPlan)} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Project</label>
                    <select {...regSprint("project_id")} className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
                      <option value="">Select a project</option>
                      {projects?.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Custom Tasks (optional, comma separated)</label>
                    <Input {...regSprint("custom_tasks")} placeholder="Or enter tasks manually" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Sprint Duration (days)</label>
                      <Input type="number" {...regSprint("sprint_duration_days")} defaultValue={14} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Team Size</label>
                      <Input type="number" {...regSprint("team_size")} defaultValue={3} />
                    </div>
                  </div>
                  <Button type="submit" className="w-full gap-2" disabled={loading}>
                    {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Planning...</> : <><Target className="h-4 w-4" /> Generate Sprint Plan</>}
                  </Button>
                </form>
              </CardContent>
            </Card>
            {result && result.sprint_name && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center justify-between">
                    <span>{result.sprint_name}</span>
                    <Badge variant="info">{result.duration}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">Goals</p>
                    <ul className="space-y-1">
                      {result.goals?.map((g: string, i: number) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-primary mt-0.5">•</span>
                          {g}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">Milestones</p>
                    <ul className="space-y-1">
                      {result.milestones?.map((m: string, i: number) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-yellow-500 mt-0.5">◆</span>
                          {m}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="info">Velocity: {result.estimated_velocity}</Badge>
                    {result.risks?.length > 0 && <Badge variant="warning">{result.risks.length} risks</Badge>}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Project Summary */}
        <TabsContent value="summary">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base"><LineChart className="h-5 w-5 text-primary" />AI Project Summary</CardTitle>
                <CardDescription>Get an AI-powered summary of your project's health.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSummary(handleProjectSummary)} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Project</label>
                    <select {...regSummary("project_id")} className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
                      <option value="">Select a project</option>
                      {projects?.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Features (comma separated)</label>
                    <Input {...regSummary("features")} placeholder="Auth, Dashboard, API, etc." />
                  </div>
                  <Button type="submit" className="w-full gap-2" disabled={loading}>
                    {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Analyzing...</> : <><LineChart className="h-4 w-4" /> Generate Summary</>}
                  </Button>
                </form>
              </CardContent>
            </Card>
            {result && result.summary && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center justify-between">
                    <span>Project Health</span>
                    <Badge variant={result.health_score === "Good" ? "success" : result.health_score === "Needs Attention" ? "warning" : "destructive"}>
                      {result.health_score}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{result.summary}</p>
                  <div>
                    <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">Key Metrics</p>
                    <div className="space-y-1">
                      {result.key_metrics?.map((m: string, i: number) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary" />{m}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">Recommendations</p>
                    <ul className="space-y-1">
                      {result.recommendations?.map((r: string, i: number) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                          <Sparkles className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />{r}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Risk Analysis */}
        <TabsContent value="risk">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base"><AlertTriangle className="h-5 w-5 text-primary" />AI Risk Analysis</CardTitle>
                <CardDescription>Analyze risks in your project with AI.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRisk(handleRiskAnalysis)} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Project</label>
                    <select {...regRisk("project_id")} className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
                      <option value="">Select a project</option>
                      {projects?.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                  <Button type="submit" className="w-full gap-2" disabled={loading}>
                    {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Analyzing...</> : <><AlertTriangle className="h-4 w-4" /> Analyze Risks</>}
                  </Button>
                </form>
              </CardContent>
            </Card>
            {result && result.overall_risk_level && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center justify-between">
                    <span>Risk Assessment</span>
                    <Badge variant={result.overall_risk_level === "Low" ? "success" : result.overall_risk_level === "Medium" ? "warning" : "destructive"}>
                      {result.overall_risk_level}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {result.risks?.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">Identified Risks</p>
                      <div className="space-y-2">
                        {result.risks.map((risk: any, i: number) => (
                          <div key={i} className="p-2 rounded-lg bg-secondary/50">
                            <p className="text-sm font-medium">{risk.risk || risk.title || `Risk ${i + 1}`}</p>
                            {risk.severity && <Badge variant={risk.severity === "critical" ? "destructive" : risk.severity === "high" ? "warning" : "secondary"} className="text-[10px] mt-1 capitalize">{risk.severity}</Badge>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {result.mitigation_strategies?.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">Mitigation Strategies</p>
                      <ul className="space-y-1">
                        {result.mitigation_strategies.map((s: string, i: number) => (
                          <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                            <Sparkles className="h-3.5 w-3.5 text-green-500 mt-0.5 shrink-0" />{s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Task Prioritization */}
        <TabsContent value="priority">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base"><TrendingUp className="h-5 w-5 text-primary" />AI Task Prioritization</CardTitle>
                <CardDescription>Sort tasks by importance using AI analysis.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePriority(handleTaskPrioritization)} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Project (optional)</label>
                    <select {...regPriority("project_id")} className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
                      <option value="">All Projects</option>
                      {projects?.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Prioritization Criteria (optional)</label>
                    <Input {...regPriority("criteria")} placeholder="e.g., urgency, business value, dependencies" />
                  </div>
                  <Button type="submit" className="w-full gap-2" disabled={loading}>
                    {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Prioritizing...</> : <><TrendingUp className="h-4 w-4" /> Prioritize Tasks</>}
                  </Button>
                </form>
              </CardContent>
            </Card>
            {result && result.prioritized_tasks?.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center justify-between">
                    <span>Prioritized Tasks ({result.prioritized_tasks.length})</span>
                    <Button variant="ghost" size="icon" onClick={() => copyToClipboard(JSON.stringify(result, null, 2))}>
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {result.prioritized_tasks.map((task: any, i: number) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50">
                      <div className="w-6 h-6 rounded-full gradient-primary flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {i + 1}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium">{task.title || task.task_title}</p>
                        {task.rationale && <p className="text-xs text-muted-foreground mt-0.5">{task.rationale}</p>}
                        {task.priority_score && <Badge variant="info" className="text-[10px] mt-1">Score: {task.priority_score}</Badge>}
                      </div>
                    </div>
                  ))}
                  {result.rationale && (
                    <div className="p-3 rounded-lg bg-secondary">
                      <p className="text-xs text-muted-foreground">{result.rationale}</p>
                    </div>
                  )}
                  {result.recommended_first_actions?.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">First Actions</p>
                      <ul className="space-y-1">
                        {result.recommended_first_actions.map((action: string, i: number) => (
                          <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                            <Sparkles className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />{action}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
