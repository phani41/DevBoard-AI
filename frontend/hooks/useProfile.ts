import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { UserProfile, UserProfileUpdate } from "@/types";
import { toast } from "sonner";

export function useProfile() {
  return useQuery<UserProfile>({
    queryKey: ["profile"],
    queryFn: () => api.getProfile(),
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UserProfileUpdate) => api.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Profile updated");
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useUploadAvatar() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => api.uploadAvatar(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Avatar updated");
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (data: { current_password: string; new_password: string; confirm_password: string }) =>
      api.changePassword(data),
    onSuccess: () => toast.success("Password changed successfully"),
    onError: (error: Error) => toast.error(error.message),
  });
}
