import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/clerk-expo";
import { useQuery } from "convex/react";
import { useUserData } from "./useUserData";

export function useSchoolData() {
  const currentUser = useUserData();
  const { user, isLoaded } = useUser();

  const schoolId = currentUser?.userData?.school?._id;

  const schoolData = useQuery(
    api.schools.getSchoolData,
    schoolId ? { schoolId } : "skip"
  );

  return { schoolData, isLoading: !schoolData && !!schoolId };
}
