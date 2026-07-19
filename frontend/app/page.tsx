"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Reveal, CountUp } from "@/components/animations";
import {
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Kanban,
  BarChart3,
  Calendar,
  Users,
  Zap,
  Shield,
  MessageSquare,
  Bot,
  Layers,
  Lock,
  FileText,
  ChevronRight,
  Star,
  Menu,
  X,
  Github,
  Twitter,
  Linkedin,
  Mail,
  ChevronDown,
  Play,
  Clock,
  Globe,
  Briefcase,
  Code2,
  Search,
  Bell,
  Download,
  Moon,
  Quote,
  ArrowDown,
  Check,
  Activity,
  Plus,
} from "lucide-react";

// ──── Data ────

const FEATURES = [
  {
    icon: Bot,
    title: "AI Task Assistant",
    description: "Break down complex tasks, analyze bugs, and generate documentation with AI-powered suggestions tailored to your project.",
    color: "text-violet-500",
    bg: "bg-violet-500/10",
  },
  {
    icon: Kanban,
    title: "Kanban Board",
    description: "Drag-and-drop task management with real-time sync. Visualize your workflow from backlog to done with beautiful boards.",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    icon: Calendar,
    title: "Calendar View",
    description: "See tasks and deadlines on an interactive calendar. Never miss a milestone with visual scheduling and date tracking.",
    color: "text-orange-500",
    bg: "bg-orange-500/10",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description: "Track progress with interactive charts, completion rates, priority distribution, and team velocity metrics at a glance.",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
  {
    icon: Users,
    title: "Role-Based Access",
    description: "Granular permissions with Owner, Admin, Member, and Viewer roles. Control access at the project level.",
    color: "text-rose-500",
    bg: "bg-rose-500/10",
  },
  {
    icon: Zap,
    title: "Real-Time Sync",
    description: "Server-Sent Events keep boards, tasks, and comments in sync instantly across your entire team. No manual refresh needed.",
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
  {
    icon: Download,
    title: "File Attachments",
    description: "Upload images, PDFs, documents, and more. Files are stored securely with type validation and size limits.",
    color: "text-cyan-500",
    bg: "bg-cyan-500/10",
  },
  {
    icon: Bell,
    title: "Smart Notifications",
    description: "Get notified about task assignments, mentions, deadline changes, and project updates in real-time.",
    color: "text-indigo-500",
    bg: "bg-indigo-500/10",
  },
  {
    icon: Search,
    title: "Global Search",
    description: "Search across all your projects, tasks, and comments instantly. Filter by status, priority, assignee, and more.",
    color: "text-teal-500",
    bg: "bg-teal-500/10",
  },
  {
    icon: Mail,
    title: "Project Invitations",
    description: "Invite team members via email with customizable roles. Accept invitations with a single click.",
    color: "text-pink-500",
    bg: "bg-pink-500/10",
  },
  {
    icon: Moon,
    title: "Dark Mode",
    description: "Switch between light and dark themes seamlessly. Your eyes will thank you during those late-night coding sessions.",
    color: "text-slate-500",
    bg: "bg-slate-500/10",
  },
  {
    icon: MessageSquare,
    title: "Team Collaboration",
    description: "Comment on tasks, share updates, and keep everyone aligned. Real-time activity feeds show what your team is working on.",
    color: "text-fuchsia-500",
    bg: "bg-fuchsia-500/10",
  },
];

const HOW_IT_WORKS = [
  { step: 1, title: "Create Project", description: "Set up your project in seconds. Add a name, description, and choose your workflow preferences.", icon: Plus },
  { step: 2, title: "Invite Members", description: "Invite your team via email. Assign roles and permissions to control who does what in each project.", icon: Users },
  { step: 3, title: "Assign Tasks", description: "Create and assign tasks with priorities, due dates, and labels. Drag and drop to organize your board.", icon: CheckCircle2 },
  { step: 4, title: "Track Progress", description: "Monitor progress with real-time kanban boards, analytics charts, and activity timelines.", icon: Activity },
  { step: 5, title: "AI Suggestions", description: "Get AI-powered recommendations for task breakdown, bug fixes, documentation, and sprint planning.", icon: Bot },
];

const TESTIMONIALS = [
  {
    name: "Alex Chen",
    role: "Engineering Lead",
    company: "TechFlow Inc.",
    avatar: "AC",
    content: "DevBoard AI transformed how our team manages sprints. The AI task breakdown feature alone saved us hours of planning time each week. The real-time sync keeps everyone aligned.",
  },
  {
    name: "Sarah Mitchell",
    role: "Product Manager",
    company: "CloudScale",
    avatar: "SM",
    content: "The real-time collaboration is incredible. My entire team sees updates instantly across our kanban board. No more 'did you refresh?' conversations. It just works.",
  },
  {
    name: "James Rodriguez",
    role: "Freelance Developer",
    company: "Independent",
    avatar: "JR",
    content: "As a solo developer, the AI-powered analytics and task prioritization help me stay focused on what matters most. And it's completely free with no hidden limits.",
  },
];

const COMPARISON = [
  { traditional: "Expensive per-seat pricing", ai: "100% Free forever" },
  { traditional: "No AI assistance", ai: "AI-powered task breakdown & analysis" },
  { traditional: "Manual status updates", ai: "Real-time auto-sync" },
  { traditional: "Limited integrations", ai: "Open API & webhooks" },
  { traditional: "Complex setup process", ai: "Instant onboarding" },
  { traditional: "No role-based access", ai: "Granular RBAC (4 roles)" },
  { traditional: "No analytics", ai: "Advanced charts & metrics" },
  { traditional: "No dark mode", ai: "Dark/Light theme support" },
];

const FAQS = [
  { q: "Is DevBoard AI really free?", a: "Yes! DevBoard AI is completely free to use. There are no paid plans, hidden fees, or usage limits. We believe powerful project management should be accessible to everyone." },
  { q: "What AI models power the features?", a: "DevBoard AI uses OpenRouter to access cutting-edge AI models including GPT-4 and Claude. This powers task breakdown, bug analysis, documentation generation, sprint planning, and risk analysis." },
  { q: "How secure is my data?", a: "Extremely secure. We use JWT authentication, Argon2id password hashing (the OWASP-recommended algorithm), project-scoped data isolation, and rate limiting. Passwords are hashed with pwdlib's Argon2id." },
  { q: "Can I invite unlimited team members?", a: "Absolutely! There's no limit on team members or projects. Invite your entire organization via email with customizable roles — Owner, Admin, Member, or Viewer." },
  { q: "What file types can I upload?", a: "You can upload images (JPEG, PNG, GIF, WebP, SVG), PDFs, ZIP files, Word documents, and Excel spreadsheets. Each file can be up to 50MB." },
  { q: "How do I get started?", a: "Simply create a free account, create your first project, and start adding tasks. The AI features are available immediately — no credit card required, no setup needed." },
];

// ──── Components ────

function FeatureCard({ icon: Icon, title, description, color, bg }: typeof FEATURES[0]) {
  return (
    <Card className="group relative overflow-hidden border-border/50 hover:border-primary/30 transition-all duration-500 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <CardContent className="p-6 relative">
        <div className={`w-11 h-11 rounded-xl ${bg} ${color} flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
          <Icon className="h-5 w-5" />
        </div>
        <h3 className="text-base font-semibold mb-2 group-hover:text-primary transition-colors duration-300">{title}</h3>
        <p className="text-sm text-muted-foreground/80 leading-relaxed">{description}</p>
      </CardContent>
    </Card>
  );
}

// ──── Main Page ────

export default function LandingPage() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    document.title = "DevBoard AI - AI-Powered Project Management";
  }, []);

  useEffect(() => {
    const token = api.getToken();
    if (token) {
      router.replace("/dashboard");
      return;
    }
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setScrolled(scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [router]);

  const scrollTo = (id: string) => {
    setMobileMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  if (typeof window !== "undefined" && api.getToken()) {
    return null;
  }

  const navItems = [
    { label: "Features", action: () => scrollTo("features") },
    { label: "How It Works", action: () => scrollTo("how-it-works") },
    { label: "About", action: () => router.push("/about") },
    { label: "Contact", action: () => router.push("/contact") },
    { label: "FAQ", action: () => scrollTo("faq") },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* ──────── STICKY NAVBAR ──────── */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-background/80 backdrop-blur-2xl border-b border-border/50 shadow-lg shadow-black/[0.03]"
          : "bg-transparent"
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-xl gradient-primary flex items-center justify-center group-hover:scale-105 transition-transform duration-300 shadow-lg shadow-primary/25">
                <span className="text-white font-bold text-sm">D</span>
              </div>
              <span className="font-bold text-lg">
                Dev<span className="gradient-text">Board</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-8">
              {navItems.map((item) => (
                <button
                  key={item.label}
                  onClick={item.action}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 font-medium relative group"
                >
                  {item.label}
                  <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-full" />
                </button>
              ))}
            </nav>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost" size="sm">Log In</Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="gap-1.5 shadow-lg shadow-primary/25">
                  Get Started <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>

            {/* Mobile Toggle */}
            <button className="lg:hidden p-2 rounded-lg hover:bg-secondary/50 transition-colors" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-border/50 bg-background/95 backdrop-blur-2xl animate-fade-in">
            <div className="px-4 py-4 space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.label}
                  onClick={item.action}
                  className="block w-full text-left py-2.5 px-3 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-lg transition-colors"
                >
                  {item.label}
                </button>
              ))}
              <div className="pt-3 space-y-2 border-t border-border/50 mt-3">
                <Link href="/login" className="block"><Button variant="outline" className="w-full">Log In</Button></Link>
                <Link href="/register" className="block"><Button className="w-full gap-2">Get Started <ArrowRight className="h-4 w-4" /></Button></Link>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* ──────── HERO ──────── */}
      <section id="hero" className="relative min-h-screen flex items-center pt-24 pb-16 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.03] via-background to-background pointer-events-none" />
        <div className="absolute top-1/3 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-[150px] animate-glow" />
        <div className="absolute bottom-1/3 -right-32 w-80 h-80 bg-purple-500/10 rounded-full blur-[120px] animate-glow" style={{ animationDelay: "1.5s" }} />
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium mb-6 animate-fade-in">
                <Sparkles className="h-3 w-3" />
                AI-Powered Project Management
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.1] tracking-tight mb-6 animate-fade-up">
                Manage Projects
                <br />
                <span className="gradient-text">Smarter with AI</span>
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground max-w-xl mb-8 mx-auto lg:mx-0 leading-relaxed animate-fade-up" style={{ animationDelay: "0.1s" }}>
                DevBoard AI combines powerful project management with intelligent AI assistance.
                Break down tasks, analyze bugs, generate docs, and collaborate in real-time — all for free.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-3 justify-center lg:justify-start animate-fade-up" style={{ animationDelay: "0.2s" }}>
                <Link href="/register">
                  <Button size="lg" className="gap-2 text-base px-8 h-12 shadow-xl shadow-primary/25 hover:shadow-primary/30 transition-shadow">
                    Get Started Free <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                <Button variant="outline" size="lg" className="gap-2 px-8 h-12" onClick={() => scrollTo("features")}>
                  <Play className="h-4 w-4" /> View Demo
                </Button>
              </div>
              <div className="flex items-center gap-6 mt-10 justify-center lg:justify-start animate-fade-up" style={{ animationDelay: "0.3s" }}>
                <div className="flex -space-x-2">
                  {["AC", "SM", "JR", "TK"].map((initials, i) => (
                    <Avatar key={initials} className="h-9 w-9 border-2 border-background ring-2 ring-background">
                      <AvatarFallback className="text-[10px] font-medium bg-primary/10 text-primary">{initials}</AvatarFallback>
                    </Avatar>
                  ))}
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold">
                    <span className="gradient-text"><CountUp end={1247} suffix="+" /></span> active users
                  </p>
                  <p className="text-xs text-muted-foreground">Join them today</p>
                </div>
              </div>
            </div>

            {/* Hero Dashboard Mockup */}
            <div className="flex-1 max-w-lg w-full animate-fade-up" style={{ animationDelay: "0.2s" }}>
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-3xl blur-3xl animate-float" />
                <Card className="relative overflow-hidden border-border/50 shadow-2xl bg-card/95 backdrop-blur-sm">
                  <CardContent className="p-0">
                    <div className="p-5">
                      {/* Window Controls */}
                      <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-1.5">
                          <div className="w-3 h-3 rounded-full bg-red-500/80" />
                          <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                          <div className="w-3 h-3 rounded-full bg-green-500/80" />
                        </div>
                        <Badge variant="outline" className="text-[10px] bg-primary/5 border-primary/20 text-primary">
                          <Sparkles className="h-2.5 w-2.5 mr-1" /> AI Active
                        </Badge>
                      </div>
                      {/* Tasks */}
                      <div className="space-y-2.5">
                        {[
                          { icon: CheckCircle2, color: "text-green-500", title: "Design landing page mockup", badge: "In Progress", badgeVariant: "outline" as const },
                          { icon: Clock, color: "text-yellow-500", title: "Implement authentication", badge: "Review", badgeVariant: "warning" as const },
                          { icon: CheckCircle2, color: "text-muted-foreground", title: "Setup CI/CD pipeline", badge: "Done", badgeVariant: "success" as const },
                        ].map((item, i) => (
                          <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors group">
                            <div className="flex items-center gap-3">
                              <item.icon className={`h-4 w-4 ${item.color}`} />
                              <span className={`text-sm ${item.color === "text-muted-foreground" ? "text-muted-foreground line-through" : ""}`}>{item.title}</span>
                            </div>
                            <Badge variant={item.badgeVariant} className="text-[9px] px-1.5 py-0">{item.badge}</Badge>
                          </div>
                        ))}
                      </div>
                      {/* AI Suggestion */}
                      <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Bot className="h-3.5 w-3.5 text-primary" />
                          <span>AI suggests: Break into 4 subtasks</span>
                        </div>
                        <Badge className="text-[9px] bg-primary/10 text-primary border-primary/20">✨</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──────── TRUSTED BY ──────── */}
      <section className="py-12 border-y border-border/50 bg-secondary/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 text-center mb-8 font-medium">Trusted by teams everywhere</p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-6">
            {[
              { icon: Code2, title: "Open Source", desc: "100% open source" },
              { icon: GraduationCap, title: "Students", desc: "Free for education" },
              { icon: Users, title: "Developers", desc: "Built by devs" },
              { icon: Briefcase, title: "Teams", desc: "Any size team" },
              { icon: Rocket, title: "Startups", desc: "Ship faster" },
            ].map(({ icon: Icon, title, desc }) => (
              <Card key={title} className="group hover:border-primary/20 transition-all duration-300 hover:-translate-y-0.5">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shrink-0">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">{title}</p>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ──────── FEATURES ──────── */}
      <section id="features" className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="text-center mb-16">
              <Badge variant="outline" className="mb-4 px-3 py-1.5 border-primary/20 text-primary">Features</Badge>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
                Everything You Need to Ship
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
                From AI-powered assistance to granular access controls — DevBoard AI has everything modern teams need.
              </p>
            </div>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {FEATURES.map((feature, i) => (
              <Reveal key={i} delay={i * 50}>
                <FeatureCard {...feature} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ──────── STATS ──────── */}
      <section className="py-16 bg-gradient-to-r from-primary/5 via-primary/[0.02] to-purple-500/5 border-y border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: Users, label: "Active Users", end: 1247, suffix: "+" },
              { icon: Briefcase, label: "Projects Created", end: 3821, suffix: "+" },
              { icon: CheckCircle2, label: "Tasks Completed", end: 28450, suffix: "+" },
              { icon: Bot, label: "AI Requests", end: 56200, suffix: "+" },
            ].map(({ icon: Icon, label, end, suffix }) => (
              <div key={label} className="text-center group">
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                  <Icon className="h-6 w-6" />
                </div>
                <div className="text-3xl sm:text-4xl font-bold gradient-text mb-1 tabular-nums">
                  <CountUp end={end} suffix={suffix} />
                </div>
                <p className="text-sm text-muted-foreground/80">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────── HOW IT WORKS ──────── */}
      <section id="how-it-works" className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="text-center mb-16">
              <Badge variant="outline" className="mb-4 px-3 py-1.5 border-primary/20 text-primary">How It Works</Badge>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
                Get Started in Minutes
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
                From zero to productive in five simple steps. No credit card, no complex setup.
              </p>
            </div>
          </Reveal>
          <div className="relative">
            {/* Connection Line */}
            <div className="absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-primary/40 via-primary/20 to-transparent hidden md:block" />
            
            <div className="space-y-12 md:space-y-0 relative">
              {HOW_IT_WORKS.map((item, i) => (
                <Reveal key={i} delay={i * 100}>
                  <div className={`md:flex items-center gap-8 ${i % 2 === 1 ? "md:flex-row-reverse" : ""}`}>
                    <div className="flex-1">
                      <Card className="group hover:border-primary/30 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
                        <CardContent className="p-5 sm:p-6 flex items-start gap-4">
                          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                            <item.icon className="h-5 w-5" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-semibold text-primary uppercase tracking-wider">Step {item.step}</span>
                            </div>
                            <h3 className="text-lg font-bold mb-1 group-hover:text-primary transition-colors">{item.title}</h3>
                            <p className="text-sm text-muted-foreground/80">{item.description}</p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                    <div className="hidden md:flex items-center justify-center w-16 h-16 rounded-full bg-background border-2 border-primary/20 z-10 shrink-0 mx-auto my-4 md:my-0">
                      <ArrowDown className={`h-5 w-5 text-primary ${i === HOW_IT_WORKS.length - 1 ? "opacity-0" : ""}`} />
                    </div>
                    <div className="flex-1 hidden md:block" />
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ──────── DASHBOARD PREVIEW ──────── */}
      <section className="py-20 lg:py-28 bg-gradient-to-b from-background via-primary/[0.02] to-secondary/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="text-center mb-12">
              <Badge variant="outline" className="mb-4 px-3 py-1.5 border-primary/20 text-primary">Dashboard</Badge>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
                Beautiful Dashboard, Powerful Insights
              </h2>
              <p className="text-base text-muted-foreground max-w-2xl mx-auto">
                Get a bird's-eye view of all your projects with real-time analytics, activity feeds, and AI-powered insights.
              </p>
            </div>
          </Reveal>
          <Reveal>
            <Card className="relative overflow-hidden border-border/50 shadow-2xl">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-purple-500 to-blue-500" />
              <CardContent className="p-6 sm:p-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Task Overview */}
                  <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold">Recent Tasks</h3>
                      <Badge variant="outline" className="text-[10px]">Real-time</Badge>
                    </div>
                    <div className="space-y-2">
                      {[
                        { title: "Design system components", status: "In Progress", priority: "High" },
                        { title: "API integration tests", status: "Review", priority: "Medium" },
                        { title: "User onboarding flow", status: "Done", priority: "High" },
                        { title: "Performance optimization", status: "Todo", priority: "Low" },
                      ].map((task, i) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-secondary/20 hover:bg-secondary/40 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${
                              task.status === "Done" ? "bg-green-500" :
                              task.status === "In Progress" ? "bg-blue-500" :
                              task.status === "Review" ? "bg-yellow-500" : "bg-muted-foreground"
                            }`} />
                            <span className="text-sm">{task.title}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-[9px]">{task.status}</Badge>
                            <Badge variant={
                              task.priority === "High" ? "destructive" :
                              task.priority === "Medium" ? "warning" : "secondary"
                            } className="text-[9px]">{task.priority}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Stats */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold">Quick Stats</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: "Total Tasks", value: "24", change: "+3", positive: true },
                        { label: "Completed", value: "12", change: "50%", positive: true },
                        { label: "In Progress", value: "8", change: "33%", positive: false },
                        { label: "Overdue", value: "2", change: "-1", positive: true },
                      ].map((stat, i) => (
                        <div key={i} className="p-3 rounded-xl bg-secondary/20">
                          <p className="text-[10px] text-muted-foreground mb-1">{stat.label}</p>
                          <p className="text-lg font-bold">{stat.value}</p>
                          <span className={`text-[10px] ${stat.positive ? "text-green-500" : "text-red-500"}`}>{stat.change}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Reveal>
        </div>
      </section>

      {/* ──────── WHY CHOOSE ──────── */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="text-center mb-16">
              <Badge variant="outline" className="mb-4 px-3 py-1.5 border-primary/20 text-primary">Why Choose DevBoard AI</Badge>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
                Built Different. Built Better.
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
                See how DevBoard AI compares to traditional project management tools.
              </p>
            </div>
          </Reveal>
          <Reveal>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Traditional */}
              <Card className="border-destructive/20 bg-destructive/[0.02]">
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-destructive">
                    <X className="h-5 w-5" /> Traditional Tools
                  </h3>
                  <div className="space-y-3">
                    {COMPARISON.map((item, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-destructive/10 flex items-center justify-center shrink-0 mt-0.5">
                          <X className="h-3 w-3 text-destructive" />
                        </div>
                        <span className="text-sm text-muted-foreground">{item.traditional}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* DevBoard AI */}
              <Card className="border-primary/20 bg-primary/[0.02] relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-primary text-white text-xs font-semibold px-3 py-1 rounded-bl-lg">
                  Winner
                </div>
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2 gradient-text">
                    <Check className="h-5 w-5 text-primary" /> DevBoard AI
                  </h3>
                  <div className="space-y-3">
                    {COMPARISON.map((item, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-green-500/10 flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="h-3 w-3 text-green-500" />
                        </div>
                        <span className="text-sm font-medium">{item.ai}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ──────── TESTIMONIALS ──────── */}
      <section id="testimonials" className="py-20 lg:py-28 bg-secondary/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="text-center mb-16">
              <Badge variant="outline" className="mb-4 px-3 py-1.5 border-primary/20 text-primary">Testimonials</Badge>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
                Loved by Teams Worldwide
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
                See what our users say about DevBoard AI.
              </p>
            </div>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <Reveal key={i} delay={i * 100}>
                <Card className="group hover:border-primary/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg h-full">
                  <CardContent className="p-6 flex flex-col h-full">
                    <div className="flex gap-1 mb-4">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <Star key={j} className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                      ))}
                    </div>
                    <div className="relative flex-1">
                      <Quote className="h-8 w-8 text-primary/10 absolute -top-2 -left-1" />
                      <p className="text-sm text-muted-foreground leading-relaxed relative z-10">&ldquo;{t.content}&rdquo;</p>
                    </div>
                    <div className="flex items-center gap-3 mt-6 pt-4 border-t border-border/50">
                      <Avatar className="h-10 w-10 ring-2 ring-primary/10">
                        <AvatarFallback className="text-sm font-medium">{t.avatar}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-semibold">{t.name}</p>
                        <p className="text-xs text-muted-foreground">{t.role}, {t.company}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ──────── FAQ ──────── */}
      <section id="faq" className="py-20 lg:py-28">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="text-center mb-12">
              <Badge variant="outline" className="mb-4 px-3 py-1.5 border-primary/20 text-primary">FAQ</Badge>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-base text-muted-foreground">
                Got questions? We&apos;ve got answers.
              </p>
            </div>
          </Reveal>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <Reveal key={i} delay={i * 50}>
                <div className="rounded-xl border border-border/50 overflow-hidden hover:border-primary/20 transition-colors duration-300">
                  <button
                    className="w-full flex items-center justify-between p-4 sm:p-5 text-left hover:bg-secondary/20 transition-colors"
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  >
                    <span className="text-sm font-medium pr-4">{faq.q}</span>
                    <ChevronDown className={`h-4 w-4 text-muted-foreground shrink-0 transition-all duration-300 ${
                      openFaq === i ? "rotate-180 text-primary" : ""
                    }`} />
                  </button>
                  <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    openFaq === i ? "max-h-48" : "max-h-0"
                  }`}>
                    <p className="px-4 sm:px-5 pb-4 sm:pb-5 text-sm text-muted-foreground/80 leading-relaxed">{faq.a}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ──────── CTA ──────── */}
      <section className="py-20 lg:py-28 bg-gradient-to-b from-background via-primary/[0.02] to-primary/5 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[150px] pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <Reveal>
            <Badge variant="outline" className="mb-4 px-3 py-1.5 border-primary/20 text-primary">Get Started</Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
              Ready to Manage Projects Better?
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Join thousands of teams already using DevBoard AI. It&apos;s free, forever. No credit card required.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" className="gap-2 text-base px-8 h-12 shadow-xl shadow-primary/25">
                  Get Started Free <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg" className="px-8 h-12">
                  Log In
                </Button>
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ──────── FOOTER ──────── */}
      <footer className="border-t border-border/50 bg-secondary/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12 mb-8">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <Link href="/" className="flex items-center gap-2.5 mb-4 group">
                <div className="w-8 h-8 rounded-xl gradient-primary flex items-center justify-center group-hover:scale-105 transition-transform">
                  <span className="text-white font-bold text-sm">D</span>
                </div>
                <span className="font-bold text-base">DevBoard</span>
              </Link>
              <p className="text-xs text-muted-foreground/70 max-w-xs leading-relaxed">
                AI-powered project management for modern teams. Ship faster with intelligent assistance.
              </p>
              <div className="flex items-center gap-3 mt-4">
                <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-lg hover:bg-secondary/50">
                  <Github className="h-4 w-4" />
                </a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-lg hover:bg-secondary/50">
                  <Twitter className="h-4 w-4" />
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-lg hover:bg-secondary/50">
                  <Linkedin className="h-4 w-4" />
                </a>
              </div>
            </div>

            {/* Product */}
            <div>
              <h4 className="text-sm font-semibold mb-4">Product</h4>
              <div className="space-y-3">
                <button onClick={() => scrollTo("features")} className="block text-xs text-muted-foreground hover:text-foreground transition-colors">Features</button>
                <button onClick={() => scrollTo("how-it-works")} className="block text-xs text-muted-foreground hover:text-foreground transition-colors">How It Works</button>
                <Link href="/about" className="block text-xs text-muted-foreground hover:text-foreground transition-colors">About</Link>
                <Link href="/contact" className="block text-xs text-muted-foreground hover:text-foreground transition-colors">Contact</Link>
              </div>
            </div>

            {/* Support */}
            <div>
              <h4 className="text-sm font-semibold mb-4">Support</h4>
              <div className="space-y-3">
                <button onClick={() => scrollTo("faq")} className="block text-xs text-muted-foreground hover:text-foreground transition-colors">FAQ</button>
                <Link href="/contact" className="block text-xs text-muted-foreground hover:text-foreground transition-colors">Contact Us</Link>
                <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="block text-xs text-muted-foreground hover:text-foreground transition-colors">GitHub</a>
                <a href="#" className="block text-xs text-muted-foreground hover:text-foreground transition-colors">Documentation</a>
              </div>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-sm font-semibold mb-4">Legal</h4>
              <div className="space-y-3">
                <span className="block text-xs text-muted-foreground cursor-default">Privacy Policy</span>
                <span className="block text-xs text-muted-foreground cursor-default">Terms of Service</span>
                <span className="block text-xs text-muted-foreground cursor-default">Cookie Policy</span>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground/60">&copy; 2026 DevBoard AI. Built with ❤️ for the open source community.</p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground/40">
              <span>v2.0.0</span>
              <span className="w-1 h-1 rounded-full bg-muted-foreground/20" />
              <span>MIT License</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function GraduationCap(props: React.ComponentProps<typeof Code2>) {
  return <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>;
}

function Rocket(props: React.ComponentProps<typeof Code2>) {
  return <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>;
}
