"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, Bot, Globe, Lock, Cpu, Shield, Zap, Users, Sparkles, Layers, GitFork, BookOpen, Github } from "lucide-react";

const TECH_STACK = [
  { category: "Frontend", items: ["Next.js 15", "React 19", "TypeScript", "Tailwind CSS", "shadcn/ui", "TanStack Query", "React Hook Form", "Zod"] },
  { category: "Backend", items: ["FastAPI", "Python 3.14", "SQLAlchemy", "Alembic", "Pydantic", "pwdlib (Argon2)", "JWT (python-jose)"] },
  { category: "Database", items: ["PostgreSQL (Supabase)", "Alembic Migrations", "Connection Pooling"] },
  { category: "Infrastructure", items: ["Vercel (Frontend)", "Render (Backend)", "Supabase (DB + Storage)", "Resend (Email)"] },
  { category: "AI", items: ["OpenRouter API", "GPT-4 / Claude", "AI Task Breakdown", "Bug Analysis", "Doc Generation"] },
  { category: "Real-time", items: ["Server-Sent Events (SSE)", "Event-Driven Architecture", "Project-Scoped Broadcasting"] },
];

const ARCHITECTURE = [
  { title: "Project-Scoped Multi-Tenancy", desc: "Every query is scoped by project membership. Users only see data from projects they own or are invited to.", icon: Shield },
  { title: "Role-Based Access Control", desc: "Granular permissions with Owner, Admin, Member, and Viewer roles. Each role has a defined permission matrix.", icon: Users },
  { title: "Secure Authentication", desc: "JWT tokens with Argon2id password hashing. No 72-byte bcrypt limit. Industry-standard OWASP recommendations.", icon: Lock },
  { title: "Real-Time Collaboration", desc: "Server-Sent Events broadcast changes to all project members instantly. No polling, no WebSocket complexity.", icon: Zap },
  { title: "AI Integration", desc: "OpenRouter-powered AI for task breakdown, bug analysis, documentation generation, sprint planning, and risk analysis.", icon: Bot },
  { title: "Event-Driven Activity", desc: "All actions log to activity timeline. Notifications are created automatically for relevant events.", icon: Layers },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Link>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        {/* Hero */}
        <section className="text-center">
          <Badge variant="outline" className="mb-4 px-3 py-1">About DevBoard AI</Badge>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            AI-Powered Project Management
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            We believe great project management should be accessible to everyone. 
            DevBoard AI combines the power of artificial intelligence with modern 
            collaboration tools — completely free.
          </p>
        </section>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-primary/20">
            <CardContent className="p-6">
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                <Sparkles className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-bold mb-2">Our Mission</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                To democratize project management by providing a powerful, AI-enhanced platform 
                that&apos;s free for everyone. We believe that intelligent tools shouldn&apos;t require 
                enterprise budgets — every team deserves access to AI-powered productivity.
              </p>
            </CardContent>
          </Card>
          <Card className="border-primary/20">
            <CardContent className="p-6">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center mb-4">
                <Globe className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-bold mb-2">Our Vision</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                A world where every developer, designer, and product manager has an AI co-pilot 
                that understands their project context, anticipates their needs, and helps them 
                ship better software faster — without friction or high costs.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Architecture */}
        <section>
          <div className="text-center mb-10">
            <Badge variant="outline" className="mb-4 px-3 py-1">Architecture</Badge>
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Built with modern, battle-tested technologies. Every design decision prioritizes 
              security, performance, and developer experience.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ARCHITECTURE.map((item) => (
              <Card key={item.title} className="group hover:border-primary/30 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Security */}
        <section className="bg-secondary/30 rounded-2xl p-8 lg:p-12">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-green-500/10 text-green-500 flex items-center justify-center mx-auto mb-4">
              <Lock className="h-8 w-8" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">Security First</h2>
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
              <div key={item.label} className="p-3 rounded-lg bg-background/50">
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <p className="text-sm font-medium">{item.value}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Tech Stack */}
        <section>
          <div className="text-center mb-10">
            <Badge variant="outline" className="mb-4 px-3 py-1">Technology</Badge>
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">Tech Stack</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Modern, type-safe, and production-ready technologies powering DevBoard AI.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {TECH_STACK.map((group) => (
              <Card key={group.category}>
                <CardHeader>
                  <CardTitle className="text-sm font-semibold text-primary">{group.category}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {group.items.map((item) => (
                      <Badge key={item} variant="secondary" className="text-[11px]">{item}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Open Source */}
        <section className="text-center bg-gradient-to-b from-primary/5 to-background rounded-2xl p-8 lg:p-12">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
            <GitFork className="h-8 w-8" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">Open Source</h2>
          <p className="text-muted-foreground max-w-xl mx-auto mb-6">
            DevBoard AI is built in the open. We believe in transparent development and 
            community collaboration. Fork us on GitHub.
          </p>
          <Button variant="outline" className="gap-2" asChild>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer">
              <Github className="h-4 w-4" /> View on GitHub
            </a>
          </Button>
        </section>

        {/* CTA */}
        <section className="text-center pb-8">
          <h2 className="text-2xl font-bold mb-2">Ready to Get Started?</h2>
          <p className="text-muted-foreground mb-6">Join thousands of teams using DevBoard AI for free.</p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/register">
              <Button size="lg" className="gap-2">Create Free Account <Sparkles className="h-4 w-4" /></Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" size="lg">Contact Us</Button>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
