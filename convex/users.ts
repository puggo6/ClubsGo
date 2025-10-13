import { GenericId, v } from "convex/values";
import { mutation, MutationCtx, query, QueryCtx } from "./_generated/server";

export const createUser = mutation({
  args: {
    username: v.string(),
    fullName: v.string(),
    email: v.string(),

    gradeLevel: v.optional(v.number()),
    school: v.optional(v.id("schools")),

    clubs: v.array(v.id("clubs")),
    numClubs: v.number(),
    profilePicture: v.string(),
    clerkId: v.string(),
  },

  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    await ctx.auth.getUserIdentity();

    if (existingUser) return;

    await ctx.db.insert("users", {
      username: args.username,
      fullName: args.fullName,
      email: args.email,

      role: undefined,

      gradeLevel: undefined,
      school: undefined,

      profilePicture: args.profilePicture,
      clerkId: args.clerkId,
      numClubs: 0,
      clubs: [],
    });
  },
});

export const joinClub = mutation({
  args: {
    clubId: v.id("clubs"),
    currentDate: v.string(),
  },
  handler: async (ctx, args) => {
    const currentUser = await getAuthenticatedUser(ctx);

    if (currentUser.clubs.includes(args.clubId)) return;

    const club = await ctx.db.get(args.clubId);
    if (!club) throw new Error("Club not found");

    await ctx.db.patch(currentUser._id, {
      clubs: [...currentUser.clubs, args.clubId],
      chats: club.groupChat
        ? [...(currentUser.chats ?? []), club.groupChat]
        : [...(currentUser.chats ?? [])],
    });
    const chat = club.groupChat ? await ctx.db.get(club.groupChat) : undefined;
    if (club.groupChat && chat) {
      await ctx.db.patch(club.groupChat, {
        members: [
          ...chat.members,
          { lastRead: chat.messages[0]?.message ?? "", user: currentUser._id },
        ],
      });
    }

    await ctx.db.patch(args.clubId, {
      members: [
        ...(club.members ?? []),
        { userId: currentUser._id, dateJoined: args.currentDate },
      ],
      numMembers: (club.numMembers ?? 0) + 1,
    });
  },
});

export const requestJoinClub = mutation({
  args: {
    clubId: v.id("clubs"),
  },
  handler: async (ctx, args) => {
    const currentUser = await getAuthenticatedUser(ctx);

    if (currentUser.clubs.includes(args.clubId)) return;

    const club = await ctx.db.get(args.clubId);
    if (!club) throw new Error("Club not found");
    if (currentUser.role === "student") {
      await ctx.db.patch(currentUser._id, {
        requestedClubs: [...(currentUser.requestedClubs ?? []), args.clubId],
      });

      await ctx.db.patch(args.clubId, {
        pendingMembers: [...(club.pendingMembers ?? []), currentUser._id],
      });
    }
    if (currentUser.role === "administrator") {
      await ctx.db.patch(currentUser._id, {
        requestedClubs: [...(currentUser.requestedClubs ?? []), args.clubId],
      });

      await ctx.db.patch(args.clubId, {
        pendingAdvisors: [...(club.pendingAdvisors ?? []), currentUser._id],
      });
    }
  },
});

export const joinSchool = mutation({
  args: {
    joinCode: v.string(),
  },
  handler: async (ctx, args) => {
    const currentUser = await getAuthenticatedUser(ctx);

    if (currentUser.school != null && currentUser.school != undefined) return;

    const matchedSchools = await ctx.db
      .query("schools")
      .withIndex("by_joinCode", (q) => q.eq("joinCode", args.joinCode))
      .collect();

    const school = matchedSchools[0];
    if (!school) {
      throw new Error("Invalid join code");
    }

    await ctx.db.patch(currentUser._id, {
      school: school._id,
    });
    if (!school.userList.includes(currentUser._id)) {
      await ctx.db.patch(school._id, {
        userList: [...(school.userList ?? []), currentUser._id],
      });
    }
    if (currentUser.role === "administrator") {
      await ctx.db.patch(school._id, {
        pendingAdminList: [
          ...(school?.pendingAdminList ?? []),
          currentUser._id,
        ],
      });
      await ctx.db.patch(currentUser._id, {
        approvedAdmin: false,
      });
    }
    return { schoolId: school._id };
  },
});

export const updateUserRole = mutation({
  args: {
    userId: v.id("users"),
    updateRole: v.string(),
  },
  handler: async (ctx, args) => {
    console.log("started role update, ", args.userId, "", args.updateRole);
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("User not found");
    }
    await ctx.db.patch(user._id, {
      role: args.updateRole,
    });
  },
});

export const getUserData = query({
  args: { clerkId: v.string() },
  handler: async (ctx) => {
    const currentUser = await getAuthenticatedUser(ctx);

    const school = currentUser.school
      ? await ctx.db.get(currentUser.school)
      : null;

    const clubs = await Promise.all(
      currentUser.clubs.map((clubId) => ctx.db.get(clubId))
    );
    const requestedClubs = currentUser.requestedClubs
      ? await Promise.all(
          currentUser.requestedClubs.map((clubId) => ctx.db.get(clubId))
        )
      : [];
    const chats = currentUser.chats
      ? await Promise.all(currentUser.chats?.map((c) => ctx.db.get(c)))
      : [];
    return {
      ...currentUser,
      school,
      clubs,
      requestedClubs,
      chats,
    };
  },
});
export const getSpecificUser = query({
  args: { id: v.id("users") },
  handler: async (ctx, args) => {
    const currentUser = await ctx.db.get(args.id);
    if (!currentUser) return;
    const school = currentUser.school
      ? await ctx.db.get(currentUser.school)
      : null;

    const clubs = await Promise.all(
      currentUser.clubs.map((clubId) => ctx.db.get(clubId))
    );
    const requestedClubs = currentUser.requestedClubs
      ? await Promise.all(
          currentUser.requestedClubs.map((clubId) => ctx.db.get(clubId))
        )
      : [];
    return {
      ...currentUser,
      school,
      clubs,
      requestedClubs,
    };
  },
});

export const setUserRole = mutation({
  args: {
    setRole: v.string(),
  },
  handler: async (ctx, args) => {
    const currentUser = await getAuthenticatedUser(ctx);

    if (
      currentUser.role == args.setRole ||
      (args.setRole != "student" &&
        args.setRole != "administrator" &&
        args.setRole != "superAdmin")
    ) {
      console.log("invalid role!");
      return;
    }
    await ctx.db.patch(currentUser._id, {
      role: args.setRole,
    });
  },
});

export async function getAuthenticatedUser(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Unauthorized");

  const currentUser = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
    .first();

  if (!currentUser) throw new Error("user not found");

  return currentUser;
}

export const leaveSchool = mutation({
  handler: async (ctx, args) => {
    const currentUser = await getAuthenticatedUser(ctx);
    if (!currentUser) throw new Error("User not found");

    if (!currentUser.school) return;

    const school = await ctx.db.get(currentUser.school);
    const filteredUsers = school?.userList.filter((u) => u !== currentUser._id);
    const filteredAdmins = (school?.adminList ?? []).filter(
      (u) => u !== currentUser._id
    );
    const filteredPending = (school?.pendingAdminList ?? []).filter(
      (u) => u !== currentUser._id
    );
    if (!school?._id) return;

    await ctx.db.patch(currentUser._id, {
      school: undefined,
    });
    await ctx.db.patch(school?._id, {
      userList: filteredUsers,
      adminList: filteredAdmins,
      pendingAdminList: filteredPending,
    });
  },
});

export const leaveClub = mutation({
  args: {
    clubId: v.id("clubs"),
  },
  handler: async (ctx, args) => {
    const currentUser = await getAuthenticatedUser(ctx);
    const club = await ctx.db.get(args.clubId);
    const updatedMembers = club?.members.filter(
      (member) => member.userId !== currentUser._id
    );
    const updatedClubs = currentUser.clubs.filter(
      (listId) => listId !== args.clubId
    );

    await ctx.db.patch(args.clubId, {
      members: updatedMembers,
      numMembers: (club ? club.numMembers : 0) - 1,
    });
    await ctx.db.patch(currentUser._id, {
      clubs: updatedClubs,
    });
  },
});

export const cleanUserFields = mutation({
  handler: async (ctx) => {
    const currentUser = await getAuthenticatedUser(ctx);
    const schoolId = currentUser.school;
    if (!schoolId) throw new Error();
    const school = await ctx.db.get(schoolId);
    const validClubs = new Set(school?.clubList.map((c) => c.toString()));

    if (school?.userList) {
      for (const user of school?.userList) {
        if (!validClubs) break;
        const realUser = await ctx.db.get(user);
        const filteredClubs = realUser?.clubs.filter((c) => validClubs.has(c));
        let filteredReqClubs: GenericId<"clubs">[] = [];
        if (realUser?.requestedClubs)
          filteredReqClubs = realUser?.requestedClubs.filter((c) =>
            validClubs.has(c)
          );
        await ctx.db.patch(user, {
          clubs: filteredClubs,
          requestedClubs: filteredReqClubs,
        });
      }
    }
  },
});

export const addEventToList = mutation({
  args: {
    eventId: v.id("events"),
  },
  handler: async (ctx, args) => {
    const currentUser = await getAuthenticatedUser(ctx);
    await ctx.db.patch(currentUser._id, {
      eventList: [...(currentUser.eventList ?? []), args.eventId],
    });
  },
});

export const removeEventFromList = mutation({
  args: {
    eventId: v.id("events"),
  },
  handler: async (ctx, args) => {
    const currentUser = await getAuthenticatedUser(ctx);
    await ctx.db.patch(currentUser._id, {
      eventList: [
        ...(currentUser.eventList?.filter((e) => e !== args.eventId) ?? []),
      ],
    });
  },
});
