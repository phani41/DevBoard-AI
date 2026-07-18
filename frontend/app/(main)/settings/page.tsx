"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useProfile, useUpdateProfile, useUploadAvatar, useChangePassword } from "@/hooks/useProfile";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CardSkeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  User,
  Camera,
  Loader2,
  Save,
  Shield,
  Bell,
  Clock,
  Globe,
  KeyRound,
  Activity,
} from "lucide-react";
import { getInitials, formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const profileSchema = z.object({
  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
  timezone: z.string().optional(),
});

const passwordSchema = z.object({
  current_password: z.string().min(1, "Current password is required"),
  new_password: z.string().min(8, "Password must be at least 8 characters"),
  confirm_password: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.new_password === data.confirm_password, {
  message: "Passwords do not match",
  path: ["confirm_password"],
});

const TIMEZONES = [
  "UTC", "America/New_York", "America/Chicago", "America/Denver",
  "America/Los_Angeles", "Europe/London", "Europe/Berlin", "Europe/Paris",
  "Asia/Tokyo", "Asia/Shanghai", "Asia/Kolkata", "Australia/Sydney",
  "Pacific/Auckland", "America/Sao_Paulo",
];

export default function SettingsPage() {
  const { user } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const updateProfile = useUpdateProfile();
  const uploadAvatar = useUploadAvatar();
  const changePassword = useChangePassword();

  const [activeTab, setActiveTab] = useState("profile");
  const [avatarUploading, setAvatarUploading] = useState(false);

  const { register: regProfile, handleSubmit: handleProfileSubmit, formState: { errors: profileErrors } } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      bio: profile?.bio || "",
      timezone: profile?.timezone || "UTC",
    },
    values: {
      bio: profile?.bio || "",
      timezone: profile?.timezone || "UTC",
    },
  });

  const { register: regPassword, handleSubmit: handlePasswordSubmit, reset: resetPassword, formState: { errors: passwordErrors, isSubmitting: passwordSubmitting } } = useForm({
    resolver: zodResolver(passwordSchema),
  });

  const onProfileSubmit = async (data: any) => {
    try {
      await updateProfile.mutateAsync(data);
      toast.success("Profile updated successfully");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const onPasswordSubmit = async (data: any) => {
    try {
      await changePassword.mutateAsync(data);
      resetPassword();
      toast.success("Password changed successfully");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/gif", "image/webp"].includes(file.type)) {
      toast.error("Only JPEG, PNG, GIF, and WebP images are allowed");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    setAvatarUploading(true);
    try {
      await uploadAvatar.mutateAsync(file);
      toast.success("Avatar updated successfully");
    } catch (err: any) {
      toast.error(err.message);
    }
    setAvatarUploading(false);
  };

  const handleNotificationToggle = async (key: string, value: boolean) => {
    if (!profile) return;
    const prefs = { ...profile.notification_preferences, [key]: value };
    try {
      await updateProfile.mutateAsync({ notification_preferences: prefs });
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  // Extract error messages with explicit string | null typing
  // String() converts any react-hook-form FieldError union to a plain string
  const bioErr: string | null = profileErrors.bio?.message ? String(profileErrors.bio.message) : null;
  const currentPwdErr: string | null = passwordErrors.current_password?.message ? String(passwordErrors.current_password.message) : null;
  const newPwdErr: string | null = passwordErrors.new_password?.message ? String(passwordErrors.new_password.message) : null;
  const confirmPwdErr: string | null = passwordErrors.confirm_password?.message ? String(passwordErrors.confirm_password.message) : null;

  if (profileLoading) return <CardSkeleton />;

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-secondary">
          <User className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your account and preferences</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full max-w-lg">
          <TabsTrigger value="profile" className="gap-2"><User className="h-4 w-4" /> Profile</TabsTrigger>
          <TabsTrigger value="security" className="gap-2"><Shield className="h-4 w-4" /> Security</TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2"><Bell className="h-4 w-4" /> Alerts</TabsTrigger>
          <TabsTrigger value="activity" className="gap-2"><Activity className="h-4 w-4" /> Activity</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Profile Picture</CardTitle>
              <CardDescription>Upload a profile avatar</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                <div className="relative group">
                  <Avatar className="h-20 w-20">
                    <AvatarFallback className="text-lg">
                      {user ? getInitials(user.full_name || user.username) : "U"}
                    </AvatarFallback>
                  </Avatar>
                  <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                    {avatarUploading ? (
                      <Loader2 className="h-5 w-5 animate-spin text-white" />
                    ) : (
                      <Camera className="h-5 w-5 text-white" />
                    )}
                    <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                  </label>
                </div>
                <div>
                  <p className="text-sm font-medium">{user?.full_name || user?.username}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Member since {user?.created_at ? formatDate(user.created_at) : "N/A"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Profile Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Bio</label>
                  <textarea
                    {...regProfile("bio")}
                    placeholder="Tell us about yourself..."
                    className="flex min-h-[100px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  />
                  {bioErr && <p className="text-sm text-destructive">{bioErr}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Timezone</label>
                  <select
                    {...regProfile("timezone")}
                    className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    {TIMEZONES.map((tz) => (
                      <option key={tz} value={tz}>{tz}</option>
                    ))}
                  </select>
                </div>
                <Button type="submit" className="gap-2">
                  <Save className="h-4 w-4" />
                  Save Changes
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <KeyRound className="h-4 w-4" />
                Change Password
              </CardTitle>
              <CardDescription>Update your account password</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Current Password</label>
                  <Input type="password" {...regPassword("current_password")} placeholder="Enter current password" />
                  {currentPwdErr && <p className="text-sm text-destructive">{currentPwdErr}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">New Password</label>
                  <Input type="password" {...regPassword("new_password")} placeholder="Enter new password" />
                  {newPwdErr && <p className="text-sm text-destructive">{newPwdErr}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Confirm New Password</label>
                  <Input type="password" {...regPassword("confirm_password")} placeholder="Confirm new password" />
                  {confirmPwdErr && <p className="text-sm text-destructive">{confirmPwdErr}</p>}
                </div>
                <Button type="submit" disabled={passwordSubmitting} className="gap-2">
                  {passwordSubmitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Updating...</> : <><KeyRound className="h-4 w-4" /> Update Password</>}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Account Info</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Email</span>
                  <span className="text-sm font-medium">{user?.email}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Username</span>
                  <span className="text-sm font-medium">{user?.username}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Account Status</span>
                  <Badge variant="success" className="capitalize">{user?.is_active ? "Active" : "Inactive"}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Notification Preferences
              </CardTitle>
              <CardDescription>Choose which notifications you'd like to receive</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {profile?.notification_preferences && Object.entries(profile.notification_preferences).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                    <div>
                      <p className="text-sm font-medium capitalize">{key.replace(/_/g, " ")}</p>
                      <p className="text-xs text-muted-foreground">
                        {key === "task_assigned" && "When a task is assigned to you"}
                        {key === "comment_added" && "When someone comments on your task"}
                        {key === "due_date_reminder" && "Reminders for upcoming due dates"}
                        {key === "invitation" && "When invited to a project"}
                        {key === "project_update" && "When a project is updated"}
                        {key === "password_changed" && "When your password changes"}
                      </p>
                    </div>
                    <button
                      onClick={() => handleNotificationToggle(key, !value)}
                      className={`relative w-10 h-6 rounded-full transition-colors ${value ? "bg-primary" : "bg-secondary"}`}
                    >
                      <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${value ? "translate-x-[18px]" : "translate-x-0.5"}`} />
                    </button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Activity className="h-8 w-8 text-muted-foreground/40 mb-2" />
                <p className="text-sm text-muted-foreground">View your full activity timeline</p>
                <Button variant="link" className="mt-2" asChild>
                  <a href="/activity">Go to Activity Timeline</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
