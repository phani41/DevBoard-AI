"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/components/animations";
import {
  ArrowLeft,
  Send,
  Mail,
  MessageSquare,
  CheckCircle2,
  Loader2,
  Github,
  Twitter,
  Linkedin,
  ArrowRight,
  Clock,
  Sparkles,
  Heart,
  HelpCircle,
  ChevronDown,
  MapPin,
  Globe,
  Check,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  message: z.string().min(20, "Message must be at least 20 characters"),
});

type ContactFormData = z.infer<typeof contactSchema>;

const FAQ = [
  { q: "How quickly will I get a response?", a: "We typically respond within 24 hours during business days. For urgent matters, reach out via our GitHub issues." },
  { q: "Can I report a bug?", a: "Absolutely! Use the contact form with 'Bug Report' as the subject, or open an issue directly on our GitHub repository." },
  { q: "Do you offer custom integrations?", a: "We're open to partnership and custom integration inquiries. Drop us a message with the details and we'll explore options together." },
  { q: "Can I contribute to the project?", a: "Yes! DevBoard AI is open source. Check out our GitHub repository for contribution guidelines and open issues." },
];

export default function ContactPage() {
  useEffect(() => {
    document.title = "Contact - DevBoard AI";
  }, []);
  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || "Failed to send message");
      }

      setSubmitted(true);
      toast.success("Message sent! We'll get back to you soon.");
    } catch (err: any) {
      toast.error(err.message || "Failed to send message. Please try again.");
    }
  };

  const errMsg = (field: keyof ContactFormData): string | null => {
    const msg = errors[field]?.message;
    return msg ? String(msg) : null;
  };

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

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-16">
        {/* ─── HERO ─── */}
        <Reveal>
          <section className="text-center max-w-3xl mx-auto">
            <Badge variant="outline" className="mb-4 px-3 py-1.5 border-primary/20 text-primary">
              <MessageSquare className="h-3 w-3 mr-1.5" /> Contact
            </Badge>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
              Get in Touch
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto">
              Have a question, suggestion, or just want to say hi? We&apos;d love to hear from you. 
              We typically respond within 24 hours.
            </p>
          </section>
        </Reveal>

        {/* ─── MAIN CONTENT ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Contact Form */}
          <div className="lg:col-span-3">
            <Reveal>
              <Card className="hover:border-primary/20 transition-colors border-border/50">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-1">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Send us a message</CardTitle>
                      <CardDescription>Fill out the form and we&apos;ll get back to you.</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {submitted ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
                      <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mb-6">
                        <CheckCircle2 className="h-10 w-10 text-green-500" />
                      </div>
                      <h3 className="text-2xl font-bold mb-2">Message Sent! 🎉</h3>
                      <p className="text-sm text-muted-foreground mb-8 max-w-sm">
                        Thank you for reaching out. We&apos;ll review your message and get back to you as soon as possible.
                      </p>
                      <Button variant="outline" onClick={() => setSubmitted(false)} className="group">
                        Send Another Message <ArrowRight className="h-3.5 w-3.5 ml-1.5 group-hover:translate-x-0.5 transition-transform" />
                      </Button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Name</label>
                          <Input
                            {...register("name")}
                            placeholder="Your name"
                            className="transition-all duration-200 focus:ring-2 focus:ring-primary/20 h-10"
                          />
                          {errMsg("name") && <p className="text-xs text-destructive mt-1">{errMsg("name")}</p>}
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Email</label>
                          <Input
                            {...register("email")}
                            type="email"
                            placeholder="your@email.com"
                            className="transition-all duration-200 focus:ring-2 focus:ring-primary/20 h-10"
                          />
                          {errMsg("email") && <p className="text-xs text-destructive mt-1">{errMsg("email")}</p>}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Subject</label>
                        <Input
                          {...register("subject")}
                          placeholder="What's this about?"
                          className="transition-all duration-200 focus:ring-2 focus:ring-primary/20 h-10"
                        />
                        {errMsg("subject") && <p className="text-xs text-destructive mt-1">{errMsg("subject")}</p>}
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Message</label>
                        <textarea
                          {...register("message")}
                          rows={6}
                          placeholder="Tell us more about your question or feedback..."
                          className="flex min-h-[140px] w-full rounded-xl border border-input bg-background px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 resize-y"
                        />
                        {errMsg("message") && <p className="text-xs text-destructive mt-1">{errMsg("message")}</p>}
                      </div>
                      <Button type="submit" disabled={isSubmitting} className="w-full gap-2 h-11 group">
                        {isSubmitting ? (
                          <><Loader2 className="h-4 w-4 animate-spin" /> Sending...</>
                        ) : (
                          <><Send className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" /> Send Message</>
                        )}
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </Reveal>

            {/* FAQ */}
            <Reveal>
              <Card className="mt-6 border-border/50">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center">
                      <HelpCircle className="h-4.5 w-4.5 text-amber-500" />
                    </div>
                    <div>
                      <CardTitle className="text-base">Quick Questions</CardTitle>
                      <CardDescription>Answers to common inquiries.</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {FAQ.map((item, i) => (
                      <div key={i} className="rounded-xl border border-border/50 overflow-hidden hover:border-primary/20 transition-colors">
                        <button
                          className="w-full flex items-center justify-between p-4 text-left hover:bg-secondary/20 transition-colors"
                          onClick={() => setOpenFaq(openFaq === i ? null : i)}
                        >
                          <span className="text-sm font-medium">{item.q}</span>
                          <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground shrink-0 ml-2 transition-all duration-300 ${
                            openFaq === i ? "rotate-180 text-primary" : ""
                          }`} />
                        </button>
                        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                          openFaq === i ? "max-h-24" : "max-h-0"
                        }`}>
                          <p className="px-4 pb-4 text-sm text-muted-foreground/80 leading-relaxed">{item.a}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </Reveal>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-2 space-y-4">
            <Reveal>
              <Card className="group hover:border-primary/20 transition-all duration-300 border-border/50">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Mail className="h-6 w-6" />
                  </div>
                  <h3 className="text-base font-semibold mb-1">Email</h3>
                  <p className="text-sm text-muted-foreground">hello@devboard.app</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">We reply within 24h</p>
                </CardContent>
              </Card>
            </Reveal>

            <Reveal>
              <Card className="group hover:border-primary/20 transition-all duration-300 border-border/50">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Github className="h-6 w-6" />
                  </div>
                  <h3 className="text-base font-semibold mb-1">GitHub</h3>
                  <p className="text-sm text-muted-foreground">Open an issue</p>
                  <a
                    href="https://github.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline mt-1 inline-block"
                  >
                    github.com/devboard-ai
                  </a>
                </CardContent>
              </Card>
            </Reveal>

            <Reveal>
              <Card className="group hover:border-primary/20 transition-all duration-300 border-border/50">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Twitter className="h-6 w-6" />
                  </div>
                  <h3 className="text-base font-semibold mb-1">Twitter</h3>
                  <p className="text-sm text-muted-foreground">Follow us for updates</p>
                  <span className="text-xs text-muted-foreground/60 mt-1 inline-block">@devboard_ai</span>
                </CardContent>
              </Card>
            </Reveal>

            <Reveal>
              <Card className="group hover:border-primary/20 transition-all duration-300 border-border/50">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Globe className="h-6 w-6" />
                  </div>
                  <h3 className="text-base font-semibold mb-1">Open Source</h3>
                  <p className="text-sm text-muted-foreground">MIT Licensed</p>
                  <span className="text-xs text-muted-foreground/60 mt-1 inline-block">Free forever</span>
                </CardContent>
              </Card>
            </Reveal>

            <Reveal>
              <Card className="group hover:border-primary/20 transition-all duration-300 border-border/50">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <MapPin className="h-6 w-6" />
                  </div>
                  <h3 className="text-base font-semibold mb-1">Location</h3>
                  <p className="text-sm text-muted-foreground">Remote-First Team</p>
                  <span className="text-xs text-muted-foreground/60 mt-1 inline-block">Worldwide</span>
                </CardContent>
              </Card>
            </Reveal>

            {/* Response Time Card */}
            <Reveal>
              <Card className="bg-gradient-to-br from-primary/5 via-primary/[0.02] to-purple-500/5 border-primary/10">
                <CardContent className="p-5 text-center">
                  <Clock className="h-8 w-8 text-primary mx-auto mb-3" />
                  <p className="text-sm font-semibold mb-1">Response Time</p>
                  <p className="text-xs text-muted-foreground mb-4">We typically respond within 24 hours during business days.</p>
                  <Link href="/register">
                    <Button size="sm" className="w-full gap-1.5">
                      Create Account <Sparkles className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </Reveal>
          </div>
        </div>

        {/* ─── SOCIAL PROOF ─── */}
        <Reveal>
          <div className="text-center pt-4 pb-2">
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-secondary/50 border border-border/50">
              <Heart className="h-4 w-4 text-red-500 fill-red-500" />
              <span className="text-sm text-muted-foreground">We read every message. Your feedback shapes DevBoard AI.</span>
            </div>
          </div>
        </Reveal>
      </div>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-border/50 bg-secondary/10 mt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg gradient-primary flex items-center justify-center">
                <span className="text-white font-bold text-xs">D</span>
              </div>
              <span className="font-bold text-sm">DevBoard</span>
            </div>
            <p className="text-xs text-muted-foreground/60">
              &copy; 2026 DevBoard AI. Built with ❤️ for the open source community.
            </p>
            <div className="flex items-center gap-3">
              <Link href="/" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Home</Link>
              <Link href="/about" className="text-xs text-muted-foreground hover:text-foreground transition-colors">About</Link>
              <Link href="/register" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Sign Up</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
