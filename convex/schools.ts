import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import { getAuthenticatedUser } from "./users";

export const createSchool = mutation({
  args: {
    name: v.string(),
    sName: v.string(),
  },
  handler: async (ctx, args) => {
    const currentUser = await getAuthenticatedUser(ctx);

    const code = generateJoinCode();

    const schoolId = await ctx.db.insert("schools", {
      name: args.name,
      shortName: args.sName,
      clubList: [],
      userList: [currentUser._id],
      joinCode: code,
      eventList: [],
    });

    await ctx.db.patch(currentUser._id, {
      school: schoolId,
    });

    console.log("before return");
    return schoolId;
  },
});

export const getSchoolData = query({
  args: {
    schoolId: v.optional(v.id("schools")),
  },
  handler: async (ctx, args) => {
    if (!args.schoolId) return;
    const school = await ctx.db.get(args.schoolId);

    if (!school) throw new Error("School not found");

    const clubs = await Promise.all(
      school.clubList.map((clubId) => ctx.db.get(clubId))
    );

    const users = await Promise.all(
      school.userList.map((userId) => ctx.db.get(userId))
    );

    const admins = await Promise.all(
      (school.adminList ?? []).map((userId) => ctx.db.get(userId))
    );
    const pendingAdminList = await Promise.all(
      (school.pendingAdminList ?? []).map((userId) => ctx.db.get(userId))
    );
    const events = await Promise.all(
      school.eventList
        ? school.eventList.map((eventId) => ctx.db.get(eventId))
        : []
    );

    return {
      schoolName: school.name,
      schoolShortNameL: school.shortName,
      schoolId: school._id,
      joinCode: school.joinCode,
      clubs,
      users,
      eventList: events,
      adminList: admins,
      pendingAdminList,
    };
  },
});

export function generateJoinCode(): string {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789";
  let code = "";
  for (let i = 0; i < 5; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    code += characters[randomIndex];
  }
  return code;
}

export const getSchoolByJoinCode = query({
  args: {
    joinCode: v.string(),
  },
  handler: async (ctx, args) => {
    const schoolsList = await ctx.db
      .query("schools")
      .withIndex("by_joinCode", (q) => q.eq("joinCode", args.joinCode))
      .collect();

    return schoolsList[0] ?? null;
  },
});

export const cleanClubListOther = mutation({
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

    if (validClubIds.length !== school.clubList.length) {
      await ctx.db.patch(args.schoolId, {
        clubList: validClubIds,
      });
    }
  },
});

export const removeDeletedUsersFromSchools = mutation({
  handler: async (ctx) => {
    console.log("ran remove");

    const currentUser = await getAuthenticatedUser(ctx);
    if (!currentUser.school) throw new Error("School not found");
    const school = await ctx.db.get(currentUser.school);
    if (!school) throw new Error();
    const users = school.userList ?? [];
    const validUserIds = new Set(users.map((user) => user.toString()));

    const originalUsers = school.userList ?? [];

    const filteredUsers = originalUsers.filter((id: string) =>
      validUserIds.has(id)
    );

    if (filteredUsers.length !== originalUsers.length) {
      console.log("removed triggered");
      await ctx.db.patch(school._id, {
        userList: filteredUsers,
      });
    }
  },
});
export const approveJoinRequest = mutation({
  args: {
    schoolId: v.id("schools"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const school = await ctx.db.get(args.schoolId);
    const user = await ctx.db.get(args.userId);
    const newPending = school?.pendingAdminList?.filter(
      (id) => id !== args.userId
    );
    await ctx.db.patch(args.schoolId, {
      pendingAdminList: newPending,
      adminList: [...(school?.adminList ?? []), args.userId],
    });
    await ctx.db.patch(args.userId, {
      approvedAdmin: true,
    });
  },
});
