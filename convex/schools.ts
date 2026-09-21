import { ConvexError, v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import { getAuthenticatedUser } from "./users";

export const createSchool = mutation({
  args: {
    name: v.string(),
    sName: v.string(),
    key: v.string(),
  },
  handler: async (ctx, args) => {
    const currentUser = await getAuthenticatedUser(ctx);
    const key = await ctx.db
      .query("keys")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .unique();
    if (!key) throw new ConvexError("KEY_DNE");
    if (key.used) throw new ConvexError("KEY_USED");
    const code = generateJoinCode();

    const schoolId = await ctx.db.insert("schools", {
      name: args.name,
      shortName: args.sName,
      clubList: [],
      userList: [currentUser._id],
      adminList: [currentUser._id],
      joinCode: code,
      eventList: [],
      configurations: {
        adminsNeedApproval: true,
        clubAdminsNeedApproval: true,
        globalSchoolPage: true,
      },
    });
    await ctx.db.patch(key._id, { schoolId, used: true });
    await ctx.db.patch(currentUser._id, {
      school: schoolId,
      approvedAdmin: true,
    });

    console.log("before return");
    return schoolId;
  },
});

export const getSchoolData = query({
  args: {
    schoolId: v.optional(v.id("schools")),
    includeClubs: v.optional(v.boolean()),
    includeUsers: v.optional(v.boolean()),
    includeEvents: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    if (!args.schoolId) return;
    const school = await ctx.db.get(args.schoolId);

    if (!school) throw new Error("School not found");

    const clubs =
      args.includeClubs === false
        ? []
        : await Promise.all(
            school.clubList.map((clubId) => ctx.db.get(clubId)),
          );

    const users =
      args.includeUsers === false
        ? []
        : await Promise.all(
            school.userList.map((userId) => ctx.db.get(userId)),
          );

    const admins = await Promise.all(
      (school.adminList ?? []).map((userId) => ctx.db.get(userId)),
    );
    const pendingAdminList = await Promise.all(
      (school.pendingAdminList ?? []).map((userId) => ctx.db.get(userId)),
    );
    const events =
      args.includeEvents === false
        ? []
        : await Promise.all(
            school.eventList
              ? school.eventList.map((eventId) => ctx.db.get(eventId))
              : [],
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
      configurations: school.configurations,
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
      validUserIds.has(id),
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
      (id) => id !== args.userId,
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
export const updateSchoolConfig = mutation({
  args: {
    schoolId: v.optional(v.id("schools")),
    adminApproval: v.boolean(),
    clubAdminApproval: v.boolean(),
    globalSchoolPage: v.boolean(),
  },
  handler: async (ctx, args) => {
    if (!args.schoolId) return;
    const school = await ctx.db.get(args.schoolId);
    if (!school) return;
    await ctx.db.patch(args.schoolId, {
      configurations: {
        adminsNeedApproval: args.adminApproval,
        clubAdminsNeedApproval: args.clubAdminApproval,
        globalSchoolPage: args.globalSchoolPage,
      },
    });
  },
});

export const deleteSchool = mutation({
  args: {
    schoolId: v.optional(v.id("schools")),
  },
  handler: async (ctx, args) => {
    const currentUser = await getAuthenticatedUser(ctx);
    if (!args.schoolId) return;
    const school = await ctx.db.get(args.schoolId);
    if (!school) throw new ConvexError("SCHOOL_DNE");

    // Only a head admin of this specific school can delete it
    if (
      currentUser.role !== "superAdmin" ||
      currentUser.school?.toString() !== args.schoolId.toString()
    ) {
      throw new ConvexError("NOT_AUTHORIZED");
    }

    // Detach every user in the school (students, parents, admins) from it
    const users = await Promise.all(
      school.userList.map((userId) => ctx.db.get(userId)),
    );
    for (const user of users) {
      if (!user) continue;
      await ctx.db.patch(user._id, {
        school: undefined,
        approvedAdmin: undefined,
      });
    }

    // Delete every club that belongs to this school
    for (const clubId of school.clubList) {
      const club = await ctx.db.get(clubId);
      if (club) {
        await ctx.db.delete(clubId);
      }
    }

    // Delete every event directly tied to the school (e.g. global events)
    if (school.eventList) {
      for (const eventId of school.eventList) {
        const event = await ctx.db.get(eventId);
        if (event) {
          await ctx.db.delete(eventId);
        }
      }
    }

    await ctx.db.delete(args.schoolId);
  },
});
