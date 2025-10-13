import { api } from "@/convex/_generated/api";

import { Id } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";

export function useEventData(eventId?: Id<"events"> | null) {
  const eventData = useQuery(
    api.events.getEventData,
    eventId ? { eventId } : "skip"
  );

  return eventData;
}
