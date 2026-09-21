import { api } from "@/convex/_generated/api";

import { Id } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";

export function useClubData(clubId?: Id<"clubs"> | null) {
  const clubData = useQuery(
    api.clubs.getClubData,
    clubId ? { clubId } : "skip",
  );

  return clubData;
}

export function useClubSummary(clubId?: Id<"clubs"> | null) {
  return useQuery(api.clubs.getClubSummary, clubId ? { clubId } : "skip");
}

export function useClubContext(clubId?: Id<"clubs"> | null) {
  return useQuery(api.clubs.getClubContext, clubId ? { clubId } : "skip");
}
