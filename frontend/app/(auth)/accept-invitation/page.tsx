"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useAcceptInvitation } from "@/hooks/useInvitations";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Loader2, ArrowRight, Mail } from "lucide-react";
import Link from "next/link";

export default function AcceptInvitationPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const { isAuthenticated, user } = useAuth();
  const acceptInvitation = useAcceptInvitation();

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setErrorMessage("Invalid invitation link. No token provided.");
      return;
    }

    if (!isAuthenticated) {
      setStatus("error");
      setErrorMessage("Please log in first to accept this invitation.");
      return;
    }

    const accept = async () => {
      try {
        await acceptInvitation.mutateAsync(token);
        setStatus("success");
      } catch (err: any) {
        setStatus("error");
        setErrorMessage(err.message || "Failed to accept invitation");
      }
    };

    accept();
  }, [token, isAuthenticated]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          {status === "loading" && (
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-white animate-spin" />
              </div>
            </div>
          )}
          {status === "success" && (
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              </div>
            </div>
          )}
          {status === "error" && (
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
                <XCircle className="h-8 w-8 text-red-500" />
              </div>
            </div>
          )}
          <CardTitle className="text-xl">
            {status === "loading" && "Accepting Invitation..."}
            {status === "success" && "Invitation Accepted! 🎉"}
            {status === "error" && "Unable to Accept Invitation"}
          </CardTitle>
          <CardDescription>
            {status === "loading" && "Please wait while we process your invitation..."}
            {status === "success" && "You've been added to the project. Start collaborating!"}
            {status === "error" && errorMessage}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {status === "success" && (
            <Button className="w-full gap-2" onClick={() => router.push("/projects")}>
              View My Projects <ArrowRight className="h-4 w-4" />
            </Button>
          )}
          {status === "error" && !isAuthenticated && (
            <>
              <Button className="w-full gap-2" asChild>
                <Link href="/login">
                  Log In <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" className="w-full gap-2" asChild>
                <Link href={`/register?redirect=/accept-invitation?token=${token}`}>
                  Create Account <Mail className="h-4 w-4" />
                </Link>
              </Button>
            </>
          )}
          {(status === "error" && isAuthenticated) && (
            <Button variant="outline" className="w-full" asChild>
              <Link href="/projects">Go to Projects</Link>
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
