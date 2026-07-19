"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Reveal } from "@/components/animations";
import {
  ArrowLeft,
  Bot,
  Globe,
  Lock,
  Shield,
  Zap,
  Users,
  Sparkles,
  Layers,
  GitFork,
  Github,
  Rocket,
  Code2,
  BookOpen,
  Database,
  Cpu,
  Server,
  Cloud,
  Mail,
  Check,
  Target,
  Eye,
  ChevronRight,
  Search,
  Palette,
  Bug,
  TrendingUp,
  Bell,
  FileText,
  Calendar,
  BarChart3,
  CalendarDays,
} from "lucide-react";

// ──── Data ────

const MILESTONES = [
  { year: "2024 Q1", title: "The Idea", desc: "DevBoard AI was born from the frustration of expensive project management tools. We set out to build something better — and free.", icon: Rocket },
  { year: "2024 Q2", title: "First Prototype", desc: "Built the initial MVP with kanban boards, task management, and basic AI integration via OpenRouter.", icon: Code2 },
  { year: "2024 Q3", title: "Public Launch", desc: "Launched to the public with AI task breakdown, real-time collaboration via SSE, and role-based access control.", icon: Globe },
  { year: "2025 Q1", title: "Advanced AI", desc: "Added sprint planning, risk analysis, documentation generation, and task prioritization powered by GPT-4 and Claude.", icon: Bot },
  { year: "2025 Q3", title: "Enterprise Ready", desc: "Achieved 1,000+ active users. Added RBAC, invitations, notifications, activity tracking, and file attachments.", icon: Shield },
  { year: "2026", title: "Open Source", desc: "Open-sourced the entire platform. Community contributions, bug fixes, and feature requests are now welcome from everyone.", icon: GitFork },
];

const TEAM = [
  { name: "Alex Rivera", role: "Founder & Lead Developer", avatar: "AR", bio: "Full-stack developer passionate about AI and open-source. Building tools that make developers' lives easier.", color: "from-violet-500/20 to-blue-500/20" },
  { name: "Maria Chen", role: "AI Engineer", avatar: "MC", bio: "Machine learning engineer specializing in LLM integration. Making AI practical and accessible for project management.", color: "from-emerald-500/20 to-teal-500/20" },
  { name: "David Kim", role: "Frontend Architect", avatar: "DK", bio: "TypeScript enthusiast and UI/UX perfectionist. Crafting beautiful, responsive interfaces with React and Next.js.", color: "from-orange-500/20 to-rose-500/20" },
];

const TECH_STACK = [
  { category: "Frontend", icon: Palette, items: ["Next.js 15", "React 19", "TypeScript", "Tailwind CSS", "shadcn/ui", "TanStack Query", "React Hook Form", "Zod"] },
  { category: "Backend", icon: Server, items: ["FastAPI", "Python 3.14", "SQLAlchemy", "Alembic", "Pydantic", "pwdlib (Argon2)", "JWT (python-jose)"] },
  { category: "Database", icon: Database, items: ["PostgreSQL", "Alembic Migrations", "Connection Pooling", "Supabase"] },
  { category: "Infrastructure", icon: Cloud, items: ["Vercel (Frontend)", "Render (Backend)", "Supabase (DB/Storage)", "Resend (Email)"] },
  { category: "AI & ML", icon: Cpu, items: ["OpenRouter API", "GPT-4", "Claude", "AI Task Breakdown", "Bug Analysis", "Doc Generation"] },
  { category: "Real-time", icon: Zap, items: ["Server-Sent Events", "Event-Driven Architecture", "Project Broadcasting"] },
];

const ARCHITECTURE = [
  { title: "Project-Scoped Multi-Tenancy", desc: "Every query is scoped by project membership. Users only see data from projects they own or are invited to.", icon: Shield },
  { title: "Role-Based Access Control", desc: "Granular permissions with Owner, Admin, Member, and Viewer roles. Each role has a defined permission matrix.", icon: Users },
  { title: "Secure Authentication", desc: "JWT tokens with Argon2id password hashing. No 72-byte bcrypt limit. Industry-standard OWASP recommendations.", icon: Lock },
  { title: "Real-Time Collaboration", desc: "Server-Sent Events broadcast changes to all project members instantly. No polling, no WebSocket complexity.", icon: Zap },
  { title: "AI Integration", desc: "OpenRouter-powered AI for task breakdown, bug analysis, documentation generation, sprint planning, and risk analysis.", icon: Bot },
  { title: "Event-Driven Activity", desc: "All actions log to activity timeline. Notifications are created automatically for relevant events.", icon: Layers },
];

const FEATURES_LIST = [
  { icon: Bot, title: "AI Task Breakdown", desc: "Complex tasks are automatically broken into manageable subtasks with priority suggestions." },
  { icon: Bug, title: "Bug Analysis", desc: "Paste error messages and get root cause analysis with step-by-step fix recommendations." },
  { icon: BookOpen, title: "Documentation", desc: "Generate project documentation, API docs, and release notes automatically." },
  { icon: Target, title: "Sprint Planning", desc: "AI-powered sprint plans based on team capacity, task complexity, and project goals." },
  { icon: TrendingUp, title: "Risk Analysis", desc: "Identify project risks early with AI-driven analysis of task dependencies and timelines." },
  { icon: Layers, title: "Task Prioritization", desc: "Prioritize tasks intelligently based on urgency, dependencies, and project objectives." },
  { icon: Users, title: "Team Management", desc: "Manage team members, roles, and permissions across all your projects from one place." },
  { icon: Bell, title: "Notifications", desc: "Real-time email and in-app notifications for task assignments, mentions, and updates." },
  { icon: FileText, title: "Activity Timeline", desc: "Complete audit trail of all project activities with timestamps and user attribution." },
  { icon: Search, title: "Global Search", desc: "Powerful search across all projects, tasks, comments, and users with advanced filters." },
  { icon: Calendar, title: "Calendar View", desc: "Visual task scheduling with drag-and-drop rescheduling and deadline tracking." },
  { icon: BarChart3, title: "Analytics", desc: "Interactive charts showing completion rates, priority distribution, and team performance." },
];

const ROADMAP = [
  { quarter: "Q2 2026", items: ["Mobile responsive improvements", "Custom workflows & automations", "Advanced reporting engine"] },
  { quarter: "Q3 2026", items: ["Integration marketplace", "GitHub/GitLab sync", "Time tracking module"] },
  { quarter: "Q4 2026", items: ["AI chat assistant", "Team availability calendar", "Resource management"] },
  { quarter: "2027+", items: ["Native mobile apps", "Enterprise SSO", "On-premise deployment"] },
];

// ──── Main Page ────

export default function AboutPage() {
  useEffect(() => {
    document.title = "About - DevBoard AI";
  }, []);
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group">
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
            Back to Home
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/login"><Button variant="ghost" size="sm">Log In</Button></Link>
            <Link href="/register"><Button size="sm">Get Started</Button></Link>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-20 lg:space-y-28">
        {/* ─── HERO ─── */}
        <Reveal>
          <section className="text-center max-w-4xl mx-auto">
            <Badge variant="outline" className="mb-4 px-3 py-1.5 border-primary/20 text-primary">
              <Sparkles className="h-3 w-3 mr-1.5" /> About DevBoard AI
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              AI-Powered Project Management,<br />
              <span className="gradient-text">Free for Everyone</span>
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              We believe great project management tools shouldn&apos;t require enterprise budgets. 
              DevBoard AI combines the power of artificial intelligence with modern collaboration tools — 
              completely free, open source, and built for teams of all sizes.
            </p>
          </section>
        </Reveal>

        {/* ─── MISSION & VISION ─── */}
        <Reveal>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="group hover:border-primary/30 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] to-transparent" />
              <CardContent className="p-6 sm:p-8 relative">
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                  <Target className="h-6 w-6" />
                </div>
                <h2 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">Our Mission</h2>
                <p className="text-sm text-muted-foreground/80 leading-relaxed">
                  To democratize project management by providing a powerful, AI-enhanced platform 
                  that&apos;s free for everyone. We believe intelligent tools shouldn&apos;t require 
                  enterprise budgets — every team deserves access to AI-powered productivity.
                </p>
              </CardContent>
            </Card>
            <Card className="group hover:border-primary/30 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/[0.03] to-transparent" />
              <CardContent className="p-6 sm:p-8 relative">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                  <Eye className="h-6 w-6" />
                </div>
                <h2 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">Our Vision</h2>
                <p className="text-sm text-muted-foreground/80 leading-relaxed">
                  A world where every developer, designer, and product manager has an AI co-pilot 
                  that understands their project context, anticipates their needs, and helps them 
                  ship better software faster — without friction or high costs.
                </p>
              </CardContent>
            </Card>
          </div>
        </Reveal>

        {/* ─── WHY DEVEBOARD AI ─── */}
        <Reveal>
          <section>
            <div className="text-center mb-12">
              <Badge variant="outline" className="mb-4 px-3 py-1.5 border-primary/20 text-primary">Why DevBoard AI</Badge>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-4">Built for Modern Teams</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Every feature is designed to make your team more productive, from AI assistance to real-time collaboration.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {FEATURES_LIST.map(({ icon: Icon, title, desc }, i) => (
                <Card key={i} className="group hover:border-primary/30 transition-all duration-300 hover:-translate-y-0.5">
                  <CardContent className="p-5 flex items-start gap-4">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <Icon className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold mb-1 group-hover:text-primary transition-colors">{title}</h3>
                      <p className="text-xs text-muted-foreground/80 leading-relaxed">{desc}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        </Reveal>

        {/* ─── TIMELINE ─── */}
        <Reveal>
          <section>
            <div className="text-center mb-12">
              <Badge variant="outline" className="mb-4 px-3 py-1.5 border-primary/20 text-primary">Our Journey</Badge>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-4">Milestones</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                The journey from idea to open-source platform.
              </p>
            </div>
            <div className="relative">
              <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-primary/40 via-primary/20 to-transparent" />
              <div className="space-y-8 md:space-y-12">
                {MILESTONES.map((item, i) => (
                  <div key={i} className={`relative flex flex-col md:flex-row items-start gap-4 md:gap-8 ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}>
                    <div className={`flex-1 ${i % 2 === 0 ? "md:text-right" : "md:text-left"}`}>
                      <Card className="group hover:border-primary/30 transition-all duration-300 hover:-translate-y-0.5">
                        <CardContent className="p-4 sm:p-5">
                          <p className="text-xs font-semibold text-primary mb-1">{item.year}</p>
                          <h3 className="text-sm font-bold mb-1.5 group-hover:text-primary transition-colors">{item.title}</h3>
                          <p className="text-xs text-muted-foreground/80 leading-relaxed">{item.desc}</p>
                        </CardContent>
                      </Card>
                    </div>
                    <div className="relative z-10 flex-shrink-0 w-12 h-12 rounded-full bg-background border-2 border-primary/20 flex items-center justify-center">
                      <item.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 hidden md:block" />
                  </div>
                ))}
              </div>
            </div>
          </section>
        </Reveal>

        {/* ─── TEAM ─── */}
        <Reveal>
          <section>
            <div className="text-center mb-12">
              <Badge variant="outline" className="mb-4 px-3 py-1.5 border-primary/20 text-primary">Team</Badge>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-4">Built with Passion</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                A small team with a big mission — making project management accessible to all.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {TEAM.map((member) => (
                <Card key={member.name} className="group hover:border-primary/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg relative overflow-hidden">
                  <div className={`absolute inset-0 bg-gradient-to-br ${member.color} opacity-50`} />
                  <CardContent className="p-6 text-center relative">
                    <Avatar className="h-20 w-20 mx-auto mb-4 ring-4 ring-background shadow-xl">
                      <AvatarFallback className="text-lg font-bold bg-gradient-to-br from-primary/20 to-purple-500/20 text-primary">
                        {member.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <h3 className="font-bold text-lg mb-1 group-hover:text-primary transition-colors">{member.name}</h3>
                    <p className="text-xs text-primary font-medium mb-3">{member.role}</p>
                    <p className="text-sm text-muted-foreground/80 leading-relaxed">{member.bio}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        </Reveal>

        {/* ─── ARCHITECTURE ─── */}
        <Reveal>
          <section>
            <div className="text-center mb-12">
              <Badge variant="outline" className="mb-4 px-3 py-1.5 border-primary/20 text-primary">Architecture</Badge>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-4">How It Works</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Built with modern, battle-tested technologies. Every design decision prioritizes security, performance, and developer experience.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ARCHITECTURE.map((item) => (
                <Card key={item.title} className="group hover:border-primary/30 hover:-translate-y-0.5 transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-3 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                      <item.icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">{item.title}</h3>
                    <p className="text-sm text-muted-foreground/80 leading-relaxed">{item.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        </Reveal>

        {/* ─── SECURITY ─── */}
        <Reveal>
          <section className="bg-gradient-to-br from-primary/[0.03] via-background to-emerald-500/[0.03] rounded-2xl p-8 lg:p-12 border border-border/50">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto mb-4 hover:scale-110 transition-transform duration-300">
                <Lock className="h-8 w-8" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-3">Security First</h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Security is not an afterthought — it&apos;s built into every layer of the application.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { label: "Authentication", value: "JWT with Argon2id" },
                { label: "Password Hashing", value: "pwdlib (Argon2id)" },
                { label: "Data Isolation", value: "Project-scoped queries" },
                { label: "Access Control", value: "Role-based (4 roles)" },
                { label: "API Security", value: "Rate limiting + CORS" },
                { label: "File Upload", value: "Type/size validation" },
              ].map((item) => (
                <div key={item.label} className="p-4 rounded-xl bg-background/50 hover:bg-background/80 border border-border/30 transition-colors">
                  <p className="text-xs text-muted-foreground mb-1">{item.label}</p>
                  <div className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    <p className="text-sm font-medium">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </Reveal>

        {/* ─── TECH STACK ─── */}
        <Reveal>
          <section>
            <div className="text-center mb-12">
              <Badge variant="outline" className="mb-4 px-3 py-1.5 border-primary/20 text-primary">Technology</Badge>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-4">Tech Stack</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Modern, type-safe, and production-ready technologies powering DevBoard AI.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {TECH_STACK.map((group) => (
                <Card key={group.category} className="group hover:border-primary/30 transition-all duration-300">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                        <group.icon className="h-4.5 w-4.5" />
                      </div>
                      <CardTitle className="text-sm font-semibold">{group.category}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {group.items.map((item) => (
                        <Badge key={item} variant="secondary" className="text-[11px] hover:bg-primary/10 hover:text-primary transition-colors cursor-default">
                          {item}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        </Reveal>

        {/* ─── ROADMAP ─── */}
        <Reveal>
          <section className="bg-gradient-to-br from-primary/[0.02] via-background to-purple-500/[0.02] rounded-2xl p-8 lg:p-12 border border-border/50">
            <div className="text-center mb-10">
              <Badge variant="outline" className="mb-4 px-3 py-1.5 border-primary/20 text-primary">Roadmap</Badge>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-4">What&apos;s Next</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                We&apos;re just getting started. Here&apos;s what we&apos;re building next.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {ROADMAP.map((phase) => (
                <Card key={phase.quarter} className="border-primary/10 bg-background/50 hover:border-primary/30 transition-colors">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <CalendarDays className="h-4 w-4 text-primary" />
                      <p className="text-xs font-semibold text-primary">{phase.quarter}</p>
                    </div>
                    <ul className="space-y-2">
                      {phase.items.map((item, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary/40 mt-1.5 shrink-0" />
                          <span className="text-xs text-muted-foreground/80">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        </Reveal>

        {/* ─── OPEN SOURCE ─── */}
        <Reveal>
          <section className="text-center bg-gradient-to-b from-primary/5 to-background rounded-2xl p-8 lg:p-12 border border-border/50">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-5 hover:scale-110 transition-transform duration-300">
              <GitFork className="h-8 w-8" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">Open Source</h2>
            <p className="text-muted-foreground max-w-xl mx-auto mb-6">
              DevBoard AI is built in the open. We believe in transparent development and 
              community collaboration. Fork us on GitHub, submit PRs, and help shape the future.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button className="gap-2 group" asChild>
                <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                  <Github className="h-4 w-4 group-hover:rotate-12 transition-transform" /> View on GitHub
                </a>
              </Button>
              <Button variant="outline" className="gap-2" asChild>
                <a href="mailto:hello@devboard.app">
                  <Mail className="h-4 w-4" /> Get Involved
                </a>
              </Button>
            </div>
          </section>
        </Reveal>

        {/* ─── CTA ─── */}
        <Reveal>
          <section className="text-center pb-8">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">Ready to Get Started?</h2>
            <p className="text-muted-foreground mb-6">Join thousands of teams using DevBoard AI for free.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/register">
                <Button size="lg" className="gap-2 shadow-xl shadow-primary/25">
                  Create Free Account <Sparkles className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline" size="lg">
                  Contact Us <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
          </section>
        </Reveal>
      </div>
    </div>
  );
}
