"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Send, Mail, MessageSquare, CheckCircle2, Loader2, Github, Twitter, ArrowRight } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { api } from "@/services/api";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  message: z.string().min(20, "Message must be at least 20 characters"),
});

type ContactFormData = z.infer<typeof contactSchema>;

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const token = api.getToken();
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const response = await fetch(`${API_BASE}/api/contact`, {
        method: "POST",
        headers,
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

  // Helper to extract error message as string
  const errMsg = (field: keyof ContactFormData): string | null => {
    const msg = errors[field]?.message;
    return msg ? String(msg) : null;
  };

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

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-10">
          <Badge variant="outline" className="mb-4 px-3 py-1">Contact</Badge>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Get in Touch</h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Have a question, suggestion, or just want to say hi? We&apos;d love to hear from you.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Contact Form */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <MessageSquare className="h-4 w-4 text-primary" />
                  Send us a message
                </CardTitle>
                <CardDescription>
                  We typically respond within 24 hours during business days.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {submitted ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
                      <CheckCircle2 className="h-8 w-8 text-green-500" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Message Sent! 🎉</h3>
                    <p className="text-sm text-muted-foreground mb-6">
                      Thank you for reaching out. We&apos;ll get back to you as soon as possible.
                    </p>
                    <Button variant="outline" onClick={() => setSubmitted(false)}>
                      Send Another Message
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Name</label>
                        <Input {...register("name")} placeholder="Your name" />
                        {errMsg("name") && <p className="text-xs text-destructive">{errMsg("name")}</p>}
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Email</label>
                        <Input {...register("email")} type="email" placeholder="your@email.com" />
                        {errMsg("email") && <p className="text-xs text-destructive">{errMsg("email")}</p>}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Subject</label>
                      <Input {...register("subject")} placeholder="What's this about?" />
                      {errMsg("subject") && <p className="text-xs text-destructive">{errMsg("subject")}</p>}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Message</label>
                      <textarea
                        {...register("message")}
                        rows={5}
                        placeholder="Tell us more about your question or feedback..."
                        className="flex min-h-[120px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      />
                      {errMsg("message") && <p className="text-xs text-destructive">{errMsg("message")}</p>}
                    </div>
                    <Button type="submit" disabled={isSubmitting} className="w-full gap-2">
                      {isSubmitting ? (
                        <><Loader2 className="h-4 w-4 animate-spin" /> Sending...</>
                      ) : (
                        <><Send className="h-4 w-4" /> Send Message</>
                      )}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
                  <Mail className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-semibold mb-1">Email</h3>
                <p className="text-xs text-muted-foreground">hello@devboard.app</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center mx-auto mb-3">
                  <Github className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-semibold mb-1">GitHub</h3>
                <p className="text-xs text-muted-foreground">Open an issue</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto mb-3">
                  <Twitter className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-semibold mb-1">Twitter</h3>
                <p className="text-xs text-muted-foreground">@devboard_ai</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Link href="/register">
                  <Button variant="ghost" size="sm" className="gap-1 text-xs">
                    Create Account <ArrowRight className="h-3 w-3" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
