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
  Lightbulb,
  Wrench,
  BookOpen,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

export default function AIPage() {
  const [activeTab, setActiveTab] = useState("breakdown");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const { register: regBreakdown, handleSubmit: handleBreakdown } = useForm();
  const { register: regBug, handleSubmit: handleBug } = useForm();
  const { register: regDocs, handleSubmit: handleDocsForm } = useForm();

  const handleTaskBreakdown = async (data: any) => {
    setLoading(true);
    setResult(null);
    try {
      const res = await api.taskBreakdown(data.task_title, data.description);
      setResult({ type: "breakdown", data: res });
    } catch (err: any) {
      toast.error(err.message);
    }
    setLoading(false);
  };

  const handleBugExplain = async (data: any) => {
    setLoading(true);
    setResult(null);
    try {
      const res = await api.explainBug(data.error_message, data.code_context);
      setResult({ type: "bug", data: res });
    } catch (err: any) {
      toast.error(err.message);
    }
    setLoading(false);
  };

  const handleDocs = async (data: any) => {
    setLoading(true);
    setResult(null);
    try {
      const features = data.features.split(",").map((f: string) => f.trim());
      const res = await api.generateDocumentation({
        project_name: data.project_name,
        description: data.description,
        features,
        doc_type: data.doc_type || "readme",
      });
      setResult({ type: "docs", data: res });
    } catch (err: any) {
      toast.error(err.message);
    }
    setLoading(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl gradient-primary">
          <Brain className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">AI Features</h1>
          <p className="text-muted-foreground mt-1">
            Powered by OpenRouter AI
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="breakdown" className="gap-2">
            <ListTree className="h-4 w-4" />
            Breakdown
          </TabsTrigger>
          <TabsTrigger value="bug" className="gap-2">
            <Bug className="h-4 w-4" />
            Bug Fix
          </TabsTrigger>
          <TabsTrigger value="docs" className="gap-2">
            <FileText className="h-4 w-4" />
            Docs
          </TabsTrigger>
        </TabsList>

        {/* Task Breakdown */}
        <TabsContent value="breakdown">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Sparkles className="h-5 w-5 text-primary" />
                  AI Task Breakdown
                </CardTitle>
                <CardDescription>
                  Enter a task and let AI break it down into actionable subtasks.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleBreakdown(handleTaskBreakdown)} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Task Title</label>
                    <Input
                      {...regBreakdown("task_title", { required: true })}
                      placeholder="e.g., Build Authentication"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Description (optional)</label>
                    <textarea
                      {...regBreakdown("description")}
                      placeholder="Describe the task in more detail..."
                      className="flex min-h-[100px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    />
                  </div>
                  <Button type="submit" className="w-full gap-2" disabled={loading}>
                    {loading ? (
                      <><Loader2 className="h-4 w-4 animate-spin" /> Processing...</>
                    ) : (
                      <><Sparkles className="h-4 w-4" /> Break Down Task</>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {result?.type === "breakdown" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <ListTree className="h-5 w-5 text-primary" />
                    Generated Subtasks
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {result.data.subtasks?.map((subtask: string, i: number) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50">
                        <div className="w-6 h-6 rounded-full gradient-primary flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {i + 1}
                        </div>
                        <p className="text-sm">{subtask}</p>
                      </div>
                    ))}
                  </div>
                  {result.data.explanation && (
                    <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/10">
                      <p className="text-xs text-muted-foreground mb-1">AI Explanation:</p>
                      <p className="text-sm">{result.data.explanation}</p>
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
                <CardTitle className="flex items-center gap-2 text-base">
                  <Bug className="h-5 w-5 text-primary" />
                  AI Bug Explainer
                </CardTitle>
                <CardDescription>
                  Paste your error and let AI analyze the root cause and solution.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleBug(handleBugExplain)} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Error Message</label>
                    <textarea
                      {...regBug("error_message", { required: true })}
                      placeholder="Paste your error message here..."
                      className="flex min-h-[120px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 font-mono"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Code Context (optional)</label>
                    <textarea
                      {...regBug("code_context")}
                      placeholder="Paste relevant code snippets..."
                      className="flex min-h-[100px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 font-mono"
                    />
                  </div>
                  <Button type="submit" className="w-full gap-2" disabled={loading}>
                    {loading ? (
                      <><Loader2 className="h-4 w-4 animate-spin" /> Analyzing...</>
                    ) : (
                      <><Wrench className="h-4 w-4" /> Analyze Error</>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {result?.type === "bug" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Lightbulb className="h-5 w-5 text-primary" />
                    Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/20">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                      <span className="text-sm font-medium text-red-500">Problem</span>
                    </div>
                    <p className="text-sm">{result.data.problem}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-orange-500/5 border border-orange-500/20">
                    <div className="flex items-center gap-2 mb-1">
                      <Bug className="h-4 w-4 text-orange-500" />
                      <span className="text-sm font-medium text-orange-500">Root Cause</span>
                    </div>
                    <p className="text-sm">{result.data.root_cause}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-green-500/5 border border-green-500/20">
                    <div className="flex items-center gap-2 mb-1">
                      <Wrench className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium text-green-500">Solution</span>
                    </div>
                    <p className="text-sm">{result.data.solution}</p>
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
                <CardTitle className="flex items-center gap-2 text-base">
                  <FileText className="h-5 w-5 text-primary" />
                  AI Documentation Generator
                </CardTitle>
                <CardDescription>
                  Generate README, API docs, or release notes for your project.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleDocsForm(handleDocs)} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Project Name</label>
                    <Input
                      {...regDocs("project_name", { required: true })}
                      placeholder="My Project"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Description</label>
                    <textarea
                      {...regDocs("description", { required: true })}
                      placeholder="Describe your project..."
                      className="flex min-h-[80px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Features (comma-separated)</label>
                    <Input
                      {...regDocs("features", { required: true })}
                      placeholder="Auth, API, Dashboard, etc."
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Documentation Type</label>
                    <select
                      {...regDocs("doc_type")}
                      className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <option value="readme">README</option>
                      <option value="api">API Documentation</option>
                      <option value="release">Release Notes</option>
                    </select>
                  </div>
                  <Button type="submit" className="w-full gap-2" disabled={loading}>
                    {loading ? (
                      <><Loader2 className="h-4 w-4 animate-spin" /> Generating...</>
                    ) : (
                      <><BookOpen className="h-4 w-4" /> Generate Docs</>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {result?.type === "docs" && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <FileText className="h-5 w-5 text-primary" />
                      Generated Documentation
                    </CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(result.data.content)}
                      className="gap-2"
                    >
                      {copied ? (
                        <><Check className="h-4 w-4" /> Copied</>
                      ) : (
                        <><Copy className="h-4 w-4" /> Copy</>
                      )}
                    </Button>
                  </div>
                  <Badge variant="info" className="mt-2 capitalize">
                    {result.data.doc_type}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <pre className="whitespace-pre-wrap font-mono text-xs bg-secondary/50 p-4 rounded-lg overflow-auto max-h-[500px]">
                      {result.data.content}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
