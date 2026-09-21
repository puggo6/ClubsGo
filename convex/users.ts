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
      newMessages: [],
    });
  },
});

export const updateUserProfile = mutation({
  args: {
    username: v.optional(v.string()),
    fullName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const currentUser = await getAuthenticatedUser(ctx);

    await ctx.db.patch(currentUser._id, {
      username: args.username ? args.username : currentUser.username,
      fullName: args.fullName ? args.fullName : currentUser.fullName,
    });
  },
});

export const deleteCurrentUser = mutation({
  handler: async (ctx) => {
    const currentUser = await getAuthenticatedUser(ctx);
    const userId = currentUser._id;

    const schools = await ctx.db.query("schools").collect();
    for (const school of schools) {
      const userList = school.userList.filter((id) => id !== userId);
      const adminList = school.adminList?.filter((id) => id !== userId);
      const pendingAdminList = school.pendingAdminList?.filter(
        (id) => id !== userId,
      );

      if (
        userList.length !== school.userList.length ||
        adminList?.length !== school.adminList?.length ||
        pendingAdminList?.length !== school.pendingAdminList?.length
      ) {
        await ctx.db.patch(school._id, {
          userList,
          adminList,
          pendingAdminList,
        });
      }
    }

    const clubs = await ctx.db.query("clubs").collect();
    for (const club of clubs) {
      const members = club.members.filter((member) => member.userId !== userId);
      const pendingMembers = club.pendingMembers?.filter((id) => id !== userId);
      const advisors = club.advisors?.filter((id) => id !== userId);
      const pendingAdvisors = club.pendingAdvisors?.filter(
        (id) => id !== userId,
      );
      const officers = club.officers?.filter((id) => id !== userId);

      if (
        members.length !== club.members.length ||
        pendingMembers?.length !== club.pendingMembers?.length ||
        advisors?.length !== club.advisors?.length ||
        pendingAdvisors?.length !== club.pendingAdvisors?.length ||
        officers?.length !== club.officers?.length
      ) {
        await ctx.db.patch(club._id, {
          members,
          pendingMembers,
          advisors,
          pendingAdvisors,
          officers,
        });
      }
    }

    const groupChats = await ctx.db.query("groupChats").collect();
    for (const groupChat of groupChats) {
      const members = groupChat.members.filter(
        (member) => member.user !== userId,
      );
      if (members.length !== groupChat.members.length) {
        await ctx.db.patch(groupChat._id, { members });
      }
    }

    const users = await ctx.db.query("users").collect();
    for (const user of users) {
      if (user._id === userId) continue;

      const requestedParents = user.requestedParents?.filter(
        (id) => id !== userId,
      );
      const approvedParents = user.approvedParents?.filter(
        (id) => id !== userId,
      );
      const requestedChildren = user.requestedChildren?.filter(
        (id) => id !== userId,
      );
      const approvedChildren = user.approvedChildren?.filter(
        (id) => id !== userId,
      );

      if (
        requestedParents?.length !== user.requestedParents?.length ||
        approvedParents?.length !== user.approvedParents?.length ||
        requestedChildren?.length !== user.requestedChildren?.length ||
        approvedChildren?.length !== user.approvedChildren?.length
      ) {
        await ctx.db.patch(user._id, {
          requestedParents,
          approvedParents,
          requestedChildren,
          approvedChildren,
        });
      }
    }

    const joinRequests = await ctx.db.query("joinRequests").collect();
    for (const request of joinRequests) {
      if (request.userId === userId) {
        await ctx.db.delete(request._id);
      }
    }

    const events = await ctx.db.query("events").collect();
    const deletedEventIds = new Set(
      events
        .filter((event) => event.creator === userId)
        .map((event) => event._id),
    );
    for (const event of events) {
      if (deletedEventIds.has(event._id)) {
        await ctx.db.delete(event._id);
      } else if (event.studentList?.includes(userId)) {
        await ctx.db.patch(event._id, {
          studentList: event.studentList.filter((id) => id !== userId),
        });
      }
    }
    for (const club of clubs) {
      if (club.eventList.some((id) => deletedEventIds.has(id))) {
        await ctx.db.patch(club._id, {
          eventList: club.eventList.filter((id) => !deletedEventIds.has(id)),
        });
      }
    }
    for (const school of schools) {
      if (school.eventList?.some((id) => deletedEventIds.has(id))) {
        await ctx.db.patch(school._id, {
          eventList: school.eventList.filter((id) => !deletedEventIds.has(id)),
        });
      }
    }

    const announcements = await ctx.db.query("announcements").collect();
    const deletedAnnouncementIds = new Set(
      announcements
        .filter((announcement) => announcement.postedBy === userId)
        .map((announcement) => announcement._id),
    );
    for (const announcement of announcements) {
      if (deletedAnnouncementIds.has(announcement._id)) {
        await ctx.db.delete(announcement._id);
      } else if (
        announcement.event &&
        deletedEventIds.has(announcement.event)
      ) {
        await ctx.db.patch(announcement._id, { event: undefined });
      }
    }
    for (const club of clubs) {
      if (club.announcementList.some((id) => deletedAnnouncementIds.has(id))) {
        await ctx.db.patch(club._id, {
          announcementList: club.announcementList.filter(
            (id) => !deletedAnnouncementIds.has(id),
          ),
        });
      }
    }
    for (const school of schools) {
      if (
        school.announcementList?.some((id) => deletedAnnouncementIds.has(id))
      ) {
        await ctx.db.patch(school._id, {
          announcementList: school.announcementList.filter(
            (id) => !deletedAnnouncementIds.has(id),
          ),
        });
      }
    }

    await ctx.db.delete(userId);
    return true;
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
    const school = await ctx.db.get(club.school);
    if (!school) return;
    const isStudent = currentUser.role === "student";
    const adminsNeedApproval =
      school.configurations?.clubAdminsNeedApproval === true &&
      club.configurations?.adminsNeedApproval === true;

    const needsApproval = club.restricted || (!isStudent && adminsNeedApproval);

    if (!needsApproval) {
      if (isStudent) {
        await ctx.db.patch(args.clubId, {
          members: [
            ...(club.members ?? []),
            {
              userId: currentUser._id,
              dateJoined: args.currentDate,
            },
          ],
          numMembers: (club.numMembers ?? 0) + 1,
        });
      } else {
        await ctx.db.patch(args.clubId, {
          advisors: [...(club.advisors ?? []), currentUser._id],
          members: [
            ...(club.members ?? []),
            {
              userId: currentUser._id,
              dateJoined: args.currentDate,
            },
          ],
        });
      }

      await ctx.db.patch(currentUser._id, {
        clubs: [...(currentUser.clubs ?? []), args.clubId],
        chats: club.groupChat
          ? [...(currentUser.chats ?? []), club.groupChat]
          : [...(currentUser.chats ?? [])],
      });

      const chat = club.groupChat
        ? await ctx.db.get(club.groupChat)
        : undefined;

      if (club.groupChat && chat) {
        await ctx.db.patch(club.groupChat, {
          members: [
            ...chat.members,
            {
              lastRead: chat.messages[0]?.message ?? "",
              user: currentUser._id,
            },
          ],
        });
      }
    } else {
      await ctx.db.patch(currentUser._id, {
        requestedClubs: [...(currentUser.requestedClubs ?? []), args.clubId],
      });

      if (isStudent) {
        await ctx.db.patch(args.clubId, {
          pendingMembers: [...(club.pendingMembers ?? []), currentUser._id],
        });
      } else {
        await ctx.db.patch(args.clubId, {
          pendingAdvisors: [...(club.pendingAdvisors ?? []), currentUser._id],
        });
      }
    }
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
export const exitChat = mutation({
  handler: async (ctx) => {
    const user = await getAuthenticatedUser(ctx);
    await ctx.db.patch(user._id, {
      currentChat: undefined,
    });
  },
});
export const assignAdvisors = mutation({
  args: {
    clubId: v.id("clubs"),
    advisorIds: v.array(v.id("users")),
    currentDate: v.string(),
  },
  handler: async (ctx, args) => {
    const club = await ctx.db.get(args.clubId);
    if (!club) throw new Error("Club not found");

    const existingAdvisors = club.advisors ?? [];
    const newAdvisorIds = args.advisorIds.filter(
      (id) => !existingAdvisors.includes(id),
    );

    if (newAdvisorIds.length === 0) return;
    const newMembers = args.advisorIds.map((a) => ({
      dateJoined: args.currentDate,
      userId: a,
    }));
    // Update the club's advisor list, and clear these users out of pendingAdvisors if present
    await ctx.db.patch(args.clubId, {
      advisors: [...existingAdvisors, ...newAdvisorIds],
      pendingAdvisors: (club.pendingAdvisors ?? []).filter(
        (id) => !newAdvisorIds.includes(id),
      ),
      members: [...club.members, ...newMembers],
    });

    // Add the club to each advisor's own record (mirrors joinClub's bookkeeping)
    const chat = club.groupChat ? await ctx.db.get(club.groupChat) : undefined;
    for (const advisorId of newAdvisorIds) {
      const advisor = await ctx.db.get(advisorId);
      if (!advisor) continue;

      if (advisor.clubs.includes(args.clubId)) continue;

      await ctx.db.patch(advisorId, {
        clubs: [...advisor.clubs, args.clubId],
        numClubs: (advisor.numClubs ?? 0) + 1,
        requestedClubs: (advisor.requestedClubs ?? []).filter(
          (id) => id !== args.clubId,
        ),
        chats: club.groupChat
          ? [...(advisor.chats ?? []), club.groupChat]
          : [...(advisor.chats ?? [])],
      });
      if (club.groupChat && chat) {
        await ctx.db.patch(club.groupChat, {
          members: [
            ...chat.members,
            { lastRead: chat.messages[0]?.message ?? "", user: advisor._id },
          ],
        });
      }
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
    if (
      currentUser.role === "administrator" ||
      currentUser.role === "superAdmin"
    ) {
      if (school.configurations?.adminsNeedApproval) {
        await ctx.db.patch(school._id, {
          pendingAdminList: [
            ...(school?.pendingAdminList ?? []),
            currentUser._id,
          ],
        });
        await ctx.db.patch(currentUser._id, {
          approvedAdmin: false,
        });
      } else {
        await ctx.db.patch(school._id, {
          adminList: [...(school?.adminList ?? []), currentUser._id],
        });
        await ctx.db.patch(currentUser._id, {
          approvedAdmin: true,
        });
      }
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
  handler: async (ctx, args) => {
    const currentUser = await getAuthenticatedUser(ctx);
    if (currentUser.clerkId !== args.clerkId) return undefined;

    const school = currentUser.school
      ? await ctx.db.get(currentUser.school)
      : null;

    const clubs = await Promise.all(
      currentUser.clubs.map((clubId) => ctx.db.get(clubId)),
    );
    const requestedClubs = currentUser.requestedClubs
      ? await Promise.all(
          currentUser.requestedClubs.map((clubId) => ctx.db.get(clubId)),
        )
      : [];
    const chats = currentUser.chats
      ? await Promise.all(currentUser.chats?.map((c) => ctx.db.get(c)))
      : [];

    const reqChild = currentUser.requestedChildren
      ? await Promise.all(
          currentUser.requestedChildren.map((c) => ctx.db.get(c)),
        )
      : [];
    const appChild = currentUser.approvedChildren
      ? await Promise.all(
          currentUser.approvedChildren.map((c) => ctx.db.get(c)),
        )
      : [];
    const reqParent = currentUser.requestedParents
      ? await Promise.all(
          currentUser.requestedParents.map((c) => ctx.db.get(c)),
        )
      : [];
    const appParent = currentUser.approvedParents
      ? await Promise.all(currentUser.approvedParents.map((c) => ctx.db.get(c)))
      : [];
    return {
      ...currentUser,
      school,
      clubs,
      requestedClubs,
      chats,
      requestedChildren: reqChild,
      approvedChildren: appChild,
      requestedParents: reqParent,
      approvedParents: appParent,
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
      currentUser.clubs.map((clubId) => ctx.db.get(clubId)),
    );
    const requestedClubs = currentUser.requestedClubs
      ? await Promise.all(
          currentUser.requestedClubs.map((clubId) => ctx.db.get(clubId)),
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

export const getManyUsers = query({
  args: { users: v.optional(v.array(v.id("users"))) },
  handler: async (ctx, args) => {
    if (!args.users) return;
    const users = await Promise.all(
      args.users.map(async (m) => {
        const user = await ctx.db.get(m);
        return {
          ...user,
        };
      }),
    );
    return {
      users,
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
  handler: async (ctx) => {
    const currentUser = await getAuthenticatedUser(ctx);
    if (!currentUser) throw new Error("User not found");

    if (!currentUser.school) return;

    const school = await ctx.db.get(currentUser.school);
    const filteredUsers = school?.userList.filter((u) => u !== currentUser._id);
    const filteredAdmins = (school?.adminList ?? []).filter(
      (u) => u !== currentUser._id,
    );
    const filteredPending = (school?.pendingAdminList ?? []).filter(
      (u) => u !== currentUser._id,
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
      (member) => member.userId !== currentUser._id,
    );
    const updatedClubs = currentUser.clubs.filter(
      (listId) => listId !== args.clubId,
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
            validClubs.has(c),
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

export const requestChild = mutation({
  args: {
    studentId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const currentUser = await getAuthenticatedUser(ctx);
    const student = await ctx.db.get(args.studentId);

    await ctx.db.patch(currentUser._id, {
      requestedChildren: [
        ...(currentUser.requestedChildren ?? []),
        args.studentId,
      ],
    });
    await ctx.db.patch(args.studentId, {
      requestedParents: [...(student?.requestedParents ?? []), currentUser._id],
    });
  },
});

export const approveParent = mutation({
  args: {
    parentId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const currentUser = await getAuthenticatedUser(ctx);
    const parent = await ctx.db.get(args.parentId);
    if (!parent) throw new Error("Parent not found");
    await ctx.db.patch(currentUser._id, {
      requestedParents: [
        ...(currentUser.requestedParents?.filter((u) => u !== args.parentId) ??
          []),
      ],
    });
    await ctx.db.patch(currentUser._id, {
      approvedParents: [...(currentUser.approvedParents ?? []), args.parentId],
    });
    await ctx.db.patch(args.parentId, {
      requestedChildren: [
        ...(parent?.requestedChildren?.filter((u) => u !== currentUser._id) ??
          []),
      ],
      approvedChildren: [...(parent?.approvedChildren ?? []), currentUser._id],
    });

    const studentChats = currentUser.chats ?? [];
    const parentChatIds = new Set(
      (parent.chats ?? []).map((c) => c.toString()),
    );

    for (const chatId of studentChats) {
      const chat = await ctx.db.get(chatId);
      if (!chat) continue;

      const alreadyMember = chat.members.some(
        (m) => m.user.toString() === args.parentId.toString(),
      );
      if (alreadyMember) continue;

      // add parent as member of the chat
      await ctx.db.patch(chatId, {
        members: [
          ...chat.members,
          {
            lastRead: chat.messages[chat.messages.length - 1]?.message ?? "",
            user: args.parentId,
          },
        ],
      });

      // add chat to parent's chat list if not already there
      if (!parentChatIds.has(chatId.toString())) {
        await ctx.db.patch(args.parentId, {
          chats: [...(parent.chats ?? []), chatId],
        });
        parent.chats = [...(parent.chats ?? []), chatId]; // keep local ref in sync for loop
      }
    }
  },
});

export const removeParent = mutation({
  args: {
    parentId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const currentUser = await getAuthenticatedUser(ctx);
    const parent = await ctx.db.get(args.parentId);

    await ctx.db.patch(currentUser._id, {
      approvedParents: [
        ...(currentUser.approvedParents?.filter((u) => u !== args.parentId) ??
          []),
      ],
    });

    await ctx.db.patch(args.parentId, {
      approvedChildren: [
        ...(parent?.approvedChildren?.filter((u) => u !== currentUser._id) ??
          []),
      ],
      chats: [
        ...(parent?.chats?.filter(
          (chatId) =>
            chatId !==
            currentUser?.chats?.find((c) => c.toString() === chatId.toString()),
        ) ?? []),
      ],
    });

    for (const chatId of currentUser.chats ?? []) {
      const chat = await ctx.db.get(chatId);
      if (!chat) continue;

      await ctx.db.patch(chatId, {
        members: [
          ...chat.members
            .filter((m) => m.user.toString() !== args.parentId.toString())
            .map((m) => ({ user: m.user, lastRead: m.lastRead })),
        ],
      });
    }
  },
});

export const removeChild = mutation({
  args: {
    childId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const currentUser = await getAuthenticatedUser(ctx);
    const child = await ctx.db.get(args.childId);

    await ctx.db.patch(currentUser._id, {
      approvedChildren: [
        ...(currentUser.approvedChildren?.filter((u) => u !== args.childId) ??
          []),
      ],
      chats: [
        ...(currentUser.chats?.filter(
          (chatId) =>
            chatId !==
            child?.chats?.find((c) => c.toString() === chatId.toString()),
        ) ?? []),
      ],
    });

    await ctx.db.patch(args.childId, {
      approvedParents: [
        ...(child?.approvedParents?.filter((u) => u !== currentUser._id) ?? []),
      ],
    });
    for (const chatId of child?.chats ?? []) {
      const chat = await ctx.db.get(chatId);
      if (!chat) continue;

      await ctx.db.patch(chatId, {
        members: [
          ...chat.members
            .filter((m) => m.user.toString() !== currentUser._id.toString())
            .map((m) => ({ user: m.user, lastRead: m.lastRead })),
        ],
      });
    }
  },
});
