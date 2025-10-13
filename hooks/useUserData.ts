import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/clerk-expo";
import { useQuery } from "convex/react";

export function useUserData() {
  const { user, isLoaded } = useUser();

  const userData = useQuery(
    api.users.getUserData,
    isLoaded && user ? { clerkId: user.id } : "skip"
  );
  if (!user) return null;

  if (!userData) return null;

  return {
    id: user.id,
    email: user.primaryEmailAddress?.emailAddress ?? "",
    fullName: user.fullName ?? "",
    profilePicture: user.imageUrl,
    userData,
  };
}
