import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { mutation } from "./_generated/server";

export const cleanClubList = mutation({
  args: {
    schoolId: v.id("schools"),
  },
  handler: async (ctx, args) => {
    const school = await ctx.db.get(args.schoolId);
    if (!school) throw new Error("School not found");

    const validClubIds: Id<"clubs">[] = [];

    for (const clubId of school.clubList) {
      const club = await ctx.db.get(clubId);
      if (club) {
        validClubIds.push(clubId);
      }
    }

    // Only update if there are removed entries
    if (validClubIds.length !== school.clubList.length) {
      await ctx.db.patch(args.schoolId, {
        clubList: validClubIds,
      });
    }
  },
});
