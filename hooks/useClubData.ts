import { api } from "@/convex/_generated/api";

import { Id } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";

export function useClubData(clubId?: Id<"clubs"> | null) {
  const clubData = useQuery(
    api.clubs.getClubData,
    clubId ? { clubId } : "skip"
  );

  return clubData;
}
