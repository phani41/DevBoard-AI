"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";
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
  Cpu,
} from "lucide-react";

const FEATURES = [
  {
    icon: Bot,
    title: "AI-Powered Assistant",
    description: "Break down tasks, analyze bugs, and generate documentation with AI. Get intelligent suggestions for your workflow.",
    color: "text-purple-500",
    bg: "bg-purple-500/10",
  },
  {
    icon: Kanban,
    title: "Kanban Boards",
    description: "Drag-and-drop task management with real-time collaboration. Visualize your workflow from todo to done.",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    icon: BarChart3,
    title: "Advanced Analytics",
    description: "Track project progress with interactive charts, completion rates, priority distribution, and team performance metrics.",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
  {
    icon: Calendar,
    title: "Calendar View",
    description: "See your tasks on a calendar. Never miss a deadline with visual scheduling and due date tracking.",
    color: "text-orange-500",
    bg: "bg-orange-500/10",
  },
  {
    icon: Users,
    title: "Role-Based Access",
    description: "Granular permissions with Owner, Admin, Member, and Viewer roles. Control who sees and does what in each project.",
    color: "text-rose-500",
    bg: "bg-rose-500/10",
  },
  {
    icon: Zap,
    title: "Real-Time Sync",
    description: "Server-Sent Events keep your board, tasks, and comments in sync across your team. No page refreshes needed.",
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "JWT authentication, Argon2 password hashing, project-scoped data isolation, and rate limiting built-in.",
    color: "text-cyan-500",
    bg: "bg-cyan-500/10",
  },
  {
    icon: MessageSquare,
    title: "Team Collaboration",
    description: "Comment on tasks, share files, and track project activity. Keep everyone aligned with real-time notifications.",
    color: "text-indigo-500",
    bg: "bg-indigo-500/10",
  },
  {
    icon: Layers,
    title: "Multi-Project Dashboard",
    description: "Manage multiple projects from a single dashboard. See task overview, priorities, deadlines, and activity at a glance.",
    color: "text-teal-500",
    bg: "bg-teal-500/10",
  },
];

const TESTIMONIALS = [
  {
    name: "Alex Chen",
    role: "Engineering Lead",
    company: "TechFlow Inc.",
    avatar: "AC",
    content: "DevBoard AI transformed how our team manages sprints. The AI task breakdown feature alone saved us hours of planning time each week.",
  },
  {
    name: "Sarah Mitchell",
    role: "Product Manager",
    company: "CloudScale",
    avatar: "SM",
    content: "The real-time sync is incredible. My entire team sees updates instantly across our kanban board. No more 'did you refresh?' conversations.",
  },
  {
    name: "James Rodriguez",
    role: "Freelance Developer",
    company: "Independent",
    avatar: "JR",
    content: "As a solo developer, the AI-powered analytics and task prioritization help me stay focused on what matters most. And it's completely free!",
  },
];

const FAQS = [
  {
    q: "Is DevBoard AI really free?",
    a: "Yes! DevBoard AI is completely free to use. We believe powerful project management tools should be accessible to everyone, from freelancers to enterprise teams.",
  },
  {
    q: "What AI models power the features?",
    a: "DevBoard AI uses OpenRouter to access cutting-edge AI models including GPT-4 and Claude. This powers task breakdown, bug analysis, documentation generation, sprint planning, and risk analysis.",
  },
  {
    q: "How secure is my data?",
    a: "Extremely secure. We use JWT authentication, Argon2 password hashing (no 72-byte bcrypt limit), project-scoped data isolation, and rate limiting. Passwords are hashed with pwdlib's Argon2id — the OWASP-recommended algorithm.",
  },
  {
    q: "Can I invite my team members?",
    a: "Absolutely! You can invite unlimited team members via email. Each project supports role-based access control with granular permissions for Owner, Admin, Member, and Viewer roles.",
  },
  {
    q: "What storage options are available?",
    a: "DevBoard AI supports both local storage and Supabase for file attachments. You can upload images, PDFs, documents, and more up to 50MB per file.",
  },
  {
    q: "How do I get started?",
    a: "Simply create a free account, create your first project, and start adding tasks. The AI features are available immediately — no credit card required.",
  },
];

function FeatureCard({ icon: Icon, title, description, color, bg }: typeof FEATURES[0]) {
  return (
    <Card className="group hover:border-primary/40 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
      <CardContent className="p-6">
        <div className={`w-12 h-12 rounded-xl ${bg} ${color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="h-6 w-6" />
        </div>
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      </CardContent>
    </Card>
  );
}

export default function LandingPage() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const token = api.getToken();
    if (token) {
      router.replace("/dashboard");
      return;
    }

    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [router]);

  const scrollTo = (id: string) => {
    setMobileMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  // If authenticated, don't render the landing (will redirect)
  if (typeof window !== "undefined" && api.getToken()) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* ──────── NAVBAR ──────── */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-background/90 backdrop-blur-xl border-b border-border" : "bg-transparent"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                <span className="text-white font-bold text-sm">D</span>
              </div>
              <span className="font-bold text-lg">DevBoard AI</span>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-8">
              <button onClick={() => scrollTo("features")} className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</button>
              <button onClick={() => scrollTo("ai")} className="text-sm text-muted-foreground hover:text-foreground transition-colors">AI</button>
              <button onClick={() => scrollTo("testimonials")} className="text-sm text-muted-foreground hover:text-foreground transition-colors">Testimonials</button>
              <button onClick={() => scrollTo("pricing")} className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</button>
              <button onClick={() => scrollTo("faq")} className="text-sm text-muted-foreground hover:text-foreground transition-colors">FAQ</button>
            </nav>

            <div className="hidden lg:flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost">Log In</Button>
              </Link>
              <Link href="/register">
                <Button className="gap-2">
                  Get Started <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button className="lg:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-border bg-background/95 backdrop-blur-xl">
            <div className="px-4 py-4 space-y-3">
              <button onClick={() => scrollTo("features")} className="block w-full text-left py-2 text-sm text-muted-foreground hover:text-foreground">Features</button>
              <button onClick={() => scrollTo("ai")} className="block w-full text-left py-2 text-sm text-muted-foreground hover:text-foreground">AI</button>
              <button onClick={() => scrollTo("testimonials")} className="block w-full text-left py-2 text-sm text-muted-foreground hover:text-foreground">Testimonials</button>
              <button onClick={() => scrollTo("pricing")} className="block w-full text-left py-2 text-sm text-muted-foreground hover:text-foreground">Pricing</button>
              <button onClick={() => scrollTo("faq")} className="block w-full text-left py-2 text-sm text-muted-foreground hover:text-foreground">FAQ</button>
              <div className="pt-2 flex flex-col gap-2">
                <Link href="/login"><Button variant="outline" className="w-full">Log In</Button></Link>
                <Link href="/register"><Button className="w-full gap-2">Get Started <ArrowRight className="h-4 w-4" /></Button></Link>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* ──────── HERO ──────── */}
      <section id="hero" className="relative min-h-screen flex items-center pt-20 pb-16 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background pointer-events-none" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[128px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-[96px] animate-pulse delay-1000" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            <div className="flex-1 text-center lg:text-left">
              <Badge variant="outline" className="mb-6 px-4 py-1.5 text-xs font-medium animate-fade-in">
                <Sparkles className="h-3 w-3 mr-1.5 text-primary" />
                AI-Powered Project Management
              </Badge>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                Manage Projects with{" "}
                <span className="gradient-text">AI Superpowers</span>
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground max-w-xl mb-8 mx-auto lg:mx-0">
                DevBoard AI combines powerful project management with intelligent AI assistance. 
                Break down tasks, analyze bugs, generate docs, and collaborate in real-time — 
                all for free.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                <Link href="/register">
                  <Button size="lg" className="gap-2 text-base px-8 h-12">
                    Get Started Free <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                <Button variant="outline" size="lg" className="gap-2 px-8 h-12" onClick={() => scrollTo("features")}>
                  <Play className="h-4 w-4" /> See Features
                </Button>
              </div>
              <div className="flex items-center gap-8 mt-10 justify-center lg:justify-start">
                <div className="flex -space-x-2">
                  {["AC", "SM", "JR", "TK"].map((initials) => (
                    <Avatar key={initials} className="h-8 w-8 border-2 border-background">
                      <AvatarFallback className="text-[10px]">{initials}</AvatarFallback>
                    </Avatar>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  <span className="text-foreground font-semibold">1,000+</span> active users
                </p>
              </div>
            </div>

            {/* Hero Image */}
            <div className="flex-1 max-w-lg w-full">
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-2xl blur-2xl" />
                <Card className="relative overflow-hidden border-primary/20">
                  <CardContent className="p-0">
                    <div className="bg-gradient-to-br from-card to-secondary/50 p-6">
                      {/* Mock Dashboard */}
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-red-500" />
                          <div className="w-3 h-3 rounded-full bg-yellow-500" />
                          <div className="w-3 h-3 rounded-full bg-green-500" />
                        </div>
                        <Badge variant="outline" className="text-[10px]">AI Active</Badge>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                          <div className="flex items-center gap-3">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            <span className="text-sm">Design landing page mockup</span>
                          </div>
                          <Badge variant="outline" className="text-[9px] py-0">In Progress</Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                          <div className="flex items-center gap-3">
                            <Clock className="h-4 w-4 text-yellow-500" />
                            <span className="text-sm">Implement authentication</span>
                          </div>
                          <Badge variant="outline" className="text-[9px] py-0">Review</Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                          <div className="flex items-center gap-3">
                            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">Setup CI/CD pipeline</span>
                          </div>
                          <Badge className="text-[9px] py-0">Done</Badge>
                        </div>
                      </div>
                      <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Bot className="h-3 w-3 text-primary" />
                          <span>AI suggests: Break into 4 subtasks</span>
                        </div>
                        <Badge className="text-[9px]">✨</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──────── FEATURES ──────── */}
      <section id="features" className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 px-3 py-1">Features</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Everything You Need to Ship
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From AI-powered assistance to granular role-based access — DevBoard AI has
              everything modern teams need to collaborate effectively.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature, i) => (
              <FeatureCard key={i} {...feature} />
            ))}
          </div>
        </div>
      </section>

      {/* ──────── AI SECTION ──────── */}
      <section id="ai" className="py-20 lg:py-28 bg-secondary/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            <div className="flex-1">
              <Badge variant="outline" className="mb-4 px-3 py-1">AI Features</Badge>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Your AI Co-Pilot for Every Project
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Stop wrestling with spreadsheets and status meetings. Let AI handle the heavy lifting.
              </p>
              <div className="space-y-4">
                {[
                  { icon: Bot, text: "Break down complex tasks into actionable subtasks" },
                  { icon: Shield, text: "Analyze bugs with root cause and solution recommendations" },
                  { icon: FileText, text: "Generate documentation, release notes, and API docs" },
                  { icon: BarChart3, text: "Get sprint plans, project summaries, and risk analysis" },
                  { icon: Layers, text: "AI-powered task prioritization based on your criteria" },
                ].map(({ icon: Icon, text }, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="text-sm">{text}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex-1 max-w-md w-full">
              <Card className="border-primary/20">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
                    <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-500">
                      <Bot className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-semibold">AI Task Breakdown</span>
                  </div>
                  <div className="space-y-3">
                    <div className="p-3 rounded-lg bg-secondary/50">
                      <p className="text-xs text-muted-foreground mb-1">Task</p>
                      <p className="text-sm font-medium">Implement user authentication flow</p>
                    </div>
                    <div className="flex justify-center">
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="space-y-2">
                      {["Design login/register UI screens", "Set up JWT token handling", "Create password reset flow", "Add OAuth2 social login", "Write integration tests"].map((subtask, i) => (
                        <div key={i} className="flex items-center gap-2 p-2 rounded-md hover:bg-secondary/30">
                          <div className="w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] flex items-center justify-center font-medium">{i + 1}</div>
                          <span className="text-xs">{subtask}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* ──────── TESTIMONIALS ──────── */}
      <section id="testimonials" className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 px-3 py-1">Testimonials</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Loved by Teams Worldwide
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              See what our users have to say about their experience with DevBoard AI.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <Card key={i} className="group hover:border-primary/30 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star key={j} className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground mb-6 leading-relaxed">&ldquo;{t.content}&rdquo;</p>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>{t.avatar}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-semibold">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.role}, {t.company}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ──────── PRICING ──────── */}
      <section id="pricing" className="py-20 lg:py-28 bg-secondary/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 px-3 py-1">Pricing</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Start for free. No credit card required. Upgrade when you need more.
            </p>
          </div>
          <div className="max-w-lg mx-auto">
            <Card className="relative overflow-hidden border-primary/30">
              <div className="absolute top-0 right-0 bg-primary text-white text-xs font-semibold px-3 py-1 rounded-bl-lg">
                Free Forever
              </div>
              <CardContent className="p-8 text-center">
                <div className="mb-6">
                  <span className="text-5xl font-bold">$0</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <p className="text-muted-foreground mb-8">Everything you need to manage projects with AI</p>
                <div className="space-y-3 text-left mb-8">
                  {[
                    "Unlimited projects",
                    "Unlimited team members",
                    "AI task breakdown & bug analysis",
                    "AI documentation generation",
                    "Real-time collaboration (SSE)",
                    "Kanban boards with drag & drop",
                    "Advanced analytics & charts",
                    "Calendar view",
                    "Role-based access control",
                    "File attachments (50MB each)",
                    "Email notifications & invitations",
                    "Activity timeline & search",
                  ].map((feature) => (
                    <div key={feature} className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
                <Link href="/register">
                  <Button size="lg" className="w-full gap-2">
                    Get Started Free <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ──────── FAQ ──────── */}
      <section id="faq" className="py-20 lg:py-28">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 px-3 py-1">FAQ</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-muted-foreground">
              Got questions? We&apos;ve got answers.
            </p>
          </div>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <div key={i} className="rounded-xl border border-border overflow-hidden">
                <button
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-secondary/30 transition-colors"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span className="text-sm font-medium">{faq.q}</span>
                  <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${openFaq === i ? "rotate-180" : ""}`} />
                </button>
                <div className={`overflow-hidden transition-all duration-300 ${openFaq === i ? "max-h-40" : "max-h-0"}`}>
                  <p className="px-4 pb-4 text-sm text-muted-foreground">{faq.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────── CTA ──────── */}
      <section className="py-20 lg:py-28 bg-gradient-to-b from-background to-primary/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge variant="outline" className="mb-4 px-3 py-1">Get Started</Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            Ready to Supercharge Your Workflow?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Join thousands of teams using DevBoard AI to manage projects smarter, not harder.
            It&apos;s free, forever.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="gap-2 text-base px-8 h-12">
                Create Free Account <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg" className="px-8 h-12">
                Log In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ──────── FOOTER ──────── */}
      <footer className="border-t border-border py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg gradient-primary flex items-center justify-center">
                  <span className="text-white font-bold text-xs">D</span>
                </div>
                <span className="font-bold">DevBoard AI</span>
              </div>
              <p className="text-xs text-muted-foreground max-w-xs">
                AI-powered project management for modern teams. Ship faster with intelligent assistance.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-3">Product</h4>
              <div className="space-y-2">
                <button onClick={() => scrollTo("features")} className="block text-xs text-muted-foreground hover:text-foreground">Features</button>
                <button onClick={() => scrollTo("ai")} className="block text-xs text-muted-foreground hover:text-foreground">AI</button>
                <button onClick={() => scrollTo("pricing")} className="block text-xs text-muted-foreground hover:text-foreground">Pricing</button>
                <Link href="/about" className="block text-xs text-muted-foreground hover:text-foreground">About</Link>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-3">Support</h4>
              <div className="space-y-2">
                <button onClick={() => scrollTo("faq")} className="block text-xs text-muted-foreground hover:text-foreground">FAQ</button>
                <Link href="/contact" className="block text-xs text-muted-foreground hover:text-foreground">Contact</Link>
                <Link href="/docs" className="block text-xs text-muted-foreground hover:text-foreground">Documentation</Link>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-3">Legal</h4>
              <div className="space-y-2">
                <span className="block text-xs text-muted-foreground">Privacy Policy</span>
                <span className="block text-xs text-muted-foreground">Terms of Service</span>
              </div>
            </div>
          </div>
          <div className="pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">© 2026 DevBoard AI. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                <Github className="h-4 w-4" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                <Linkedin className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
