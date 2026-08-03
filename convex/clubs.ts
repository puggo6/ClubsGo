import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import { getAuthenticatedUser } from "./users";

export const createClub = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    expandedDesc: v.optional(v.string()),
    clubRules: v.optional(v.string()),
    tags: v.array(v.string()),
    restricted: v.boolean(),
    restrictedType: v.optional(v.number()),

    location: v.optional(v.string()),
    meetingFrequency: v.optional(v.number()),

    applicationDesc: v.optional(v.string()),
    applicationLink: v.optional(v.string()),
    hasDeadline: v.boolean(),
    deadline: v.optional(v.string()),
    tryoutDesc: v.optional(v.string()),
    tryoutDate: v.optional(v.array(v.string())),
    tryoutStartTime: v.optional(v.string()),
    tryoutEndTime: v.optional(v.string()),
    prerequisites: v.optional(v.array(v.string())),

    currentDate: v.string(),
  },

  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const currentUser = await getAuthenticatedUser(ctx);

    if (!currentUser) throw new Error("user not found");

    const currentSchoolId = await currentUser.school;

    if (!currentSchoolId) throw new Error("user does not belong to a school");

    const chatId = await ctx.db.insert("groupChats", {
      members: [{ lastRead: "", user: currentUser._id }],
      name: args.name,
      messages: [],
    });

    const clubId = await ctx.db.insert("clubs", {
      name: args.name,
      description: args.description,
      expandedDescription: args.expandedDesc,
      clubRules: args.clubRules,
      tags: args.tags,

      restricted: args.restricted,

      school: currentSchoolId,
      members: [],
      pendingMembers: [],
      numMembers: 1,
      advisors: [],

      eventList: [],
      announcementList: [],
      nextMeeting: undefined,

      restricted0: args.applicationDesc
        ? {
            applicationDesc: args.applicationDesc,
            applicationLink: args.applicationLink,
            hasDeadline: args.hasDeadline,
            applicationDeadline: args.deadline,
          }
        : undefined,
      restricted1: args.tryoutDesc
        ? {
            tryoutDesc: args.tryoutDesc,
            tryoutDate: args.tryoutDate,
            tryoutIds: [],
          }
        : undefined,
      restricted2: args.prerequisites
        ? { prerequisites: args.prerequisites }
        : undefined,

      meetingLocation: args.location,
      meetingFreq: args.meetingFrequency,
      clubPublic: false,
      groupChat: chatId,
      leadershipRoles: [
        "President",
        "Vice President",
        "Treasurer",
        "Secretary",
      ],
      restrictedType: args.restrictedType ?? undefined,
    });
    if (args.deadline) {
      const eventId = await ctx.db.insert("events", {
        clubId: clubId,
        global: false,
        title: args.name + " Application Deadline",
        description: "",
        startTime: undefined,
        endTime: undefined,
        location: undefined,
        school: currentSchoolId,
        studentList: [],
        creator: currentUser._id,
        dateString: args.deadline,
        dateNumber: args.deadline,
        eventType: "Deadline",
      });

      await ctx.db.patch(clubId, {
        eventList: [eventId],
      });
    }
    let newEvents: Id<"events">[] = [];
    if (args.tryoutDate) {
      let events: Id<"events">[] = [];
      for (const tryout of args.tryoutDate) {
        const eventId = await ctx.db.insert("events", {
          clubId: clubId,
          global: false,
          title:
            args.name + " Tryouts Day " + (args.tryoutDate.indexOf(tryout) + 1),
          description: args.tryoutDesc,
          startTime: args.tryoutStartTime,
          endTime: args.tryoutEndTime,
          location: undefined,
          school: currentSchoolId,
          studentList: [],
          creator: currentUser._id,
          dateString: tryout,
          dateNumber: tryout,
          eventType: "Tryout",
        });
        events = [...events, eventId];
        newEvents = events;
      }
      await ctx.db.patch(clubId, {
        eventList: [...events],
        restricted1: {
          tryoutDate: [...args.tryoutDate],
          tryoutDesc: args.tryoutDesc ?? "",
          tryoutIds: [...events],
        },
      });
    }
    if (!currentUser.school) throw new Error("School not found");
    const school = await ctx.db.get(currentUser.school);
    if (!school) throw new Error("School not found");

    await ctx.db.patch(school._id, {
      clubList: [...school.clubList, clubId],
    });

    await ctx.db.patch(clubId, {
      advisors: [currentUser._id],
      members: [{ userId: currentUser._id, dateJoined: args.currentDate }],
    });
    await ctx.db.patch(currentUser._id, {
      clubs: [...currentUser.clubs, clubId],
      chats: [...(currentUser.chats ?? []), chatId],
    });

    if (args.restrictedType === 0) {
      await ctx.db.patch(clubId, {
        restricted0: {
          applicationDesc: args.applicationDesc ?? "",
          applicationLink: args.applicationLink,
          hasDeadline: args.hasDeadline,
          applicationDeadline: args.deadline,
        },
      });
    } else if (args.restrictedType === 1) {
      await ctx.db.patch(clubId, {
        restricted1: {
          tryoutDesc: args.tryoutDesc ?? "",
          tryoutDate: args.tryoutDate,
          tryoutIds: [...newEvents],
        },
      });
    } else if (args.restrictedType === 2) {
      await ctx.db.patch(clubId, {
        restricted2: {
          prerequisites: args.prerequisites ?? [],
        },
      });
    }

    // await cleanClubListOther(school._id)

    return clubId;
  },
});
export const updateClubInfo = mutation({
  args: {
    clubId: v.id("clubs"),
    name: v.string(),
    description: v.string(),
    expandedDesc: v.optional(v.string()),
    clubRules: v.optional(v.string()),
    tags: v.array(v.string()),
    restricted: v.boolean(),
    restrictedType: v.optional(v.number()),

    location: v.optional(v.string()),
    meetingFrequency: v.optional(v.number()),

    applicationDesc: v.optional(v.string()),
    applicationLink: v.optional(v.string()),
    hasDeadline: v.boolean(),
    deadline: v.optional(v.string()),
    tryoutDesc: v.optional(v.string()),
    tryoutDate: v.optional(v.array(v.string())),
    prerequisites: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.clubId, {
      name: args.name,
      description: args.description,
      expandedDescription: args.expandedDesc,
      clubRules: args.clubRules,
      tags: args.tags,

      restricted: args.restricted,
      restricted0: args.applicationDesc
        ? {
            applicationDesc: args.applicationDesc,
            applicationLink: args.applicationLink,
            hasDeadline: args.hasDeadline,
            applicationDeadline: args.deadline,
          }
        : undefined,
      restricted1: args.tryoutDesc
        ? { tryoutDesc: args.tryoutDesc, tryoutDate: args.tryoutDate }
        : undefined,
      restricted2: args.prerequisites
        ? { prerequisites: args.prerequisites }
        : undefined,

      meetingLocation: args.location,
      meetingFreq: args.meetingFrequency,
      clubPublic: false,
      restrictedType: args.restrictedType ?? undefined,
    });
    if (args.restrictedType === 0) {
      await ctx.db.patch(args.clubId, {
        restricted0: {
          applicationDesc: args.applicationDesc ?? "",
          applicationLink: args.applicationLink,
          hasDeadline: args.hasDeadline,
          applicationDeadline: args.deadline,
        },
      });
    } else if (args.restrictedType === 1) {
      await ctx.db.patch(args.clubId, {
        restricted1: {
          tryoutDesc: args.tryoutDesc ?? "",
          tryoutDate: args.tryoutDate,
        },
      });
    } else if (args.restrictedType === 2) {
      await ctx.db.patch(args.clubId, {
        restricted2: {
          prerequisites: args.prerequisites ?? [],
        },
      });
    }
  },
});
export const getClubData = query({
  args: { clubId: v.id("clubs") },
  handler: async (ctx, args) => {
    const club = await ctx.db.get(args.clubId);
    if (!club) throw new Error("club not found");

    const members = await Promise.all(
      club.members.map(async (m) => {
        const user = await ctx.db.get(m.userId);
        return {
          ...m,
          user,
        };
      })
    );

    const pendMembers = club.pendingMembers
      ? await Promise.all(
          club.pendingMembers.map(async (m) => await ctx.db.get(m))
        )
      : [];
    const pendAdvisors = club.pendingAdvisors
      ? await Promise.all(
          club.pendingAdvisors.map(async (m) => await ctx.db.get(m))
        )
      : [];
    const eventData = await Promise.all(
      club.eventList.map((eventId) => ctx.db.get(eventId))
    );

    const announcementData = await Promise.all(
      club.announcementList.map((announcementId) => ctx.db.get(announcementId))
    );
    let fullTryouts = undefined;
    if (club.restricted1?.tryoutIds) {
      fullTryouts = await Promise.all(
        club.restricted1?.tryoutIds?.map((e) => ctx.db.get(e))
      );
    }
    return {
      ...club,
      members: members,
      pendingMembers: pendMembers,
      pendingAdvisors: pendAdvisors,
      eventList: eventData,
      announcementList: announcementData,
      restricted1: {
        tryoutIds: fullTryouts,
        tryoutDate: club.restricted1?.tryoutDate,
        tryoutDesc: club.restricted1?.tryoutDesc,
      },
    };
  },
});

export const removeDeletedUsersFromClubs = mutation({
  handler: async (ctx) => {
    console.log("ran remove");
    // Fetch all current users
    const currentUser = await getAuthenticatedUser(ctx);
    if (!currentUser.school) throw new Error("School not found");
    const school = await ctx.db.get(currentUser.school);
    if (!school) throw new Error();
    const users = school?.userList ?? [];
    const validUserIds = new Set(users.map((user) => user.toString()));

    // Fetch all clubs
    const clubs = await Promise.all(
      school.clubList.map((clubId) => ctx.db.get(clubId))
    );
    for (const club of clubs) {
      if (!club) break;
      const originalMembers = club.members ?? [];

      // Filter out any user IDs that no longer exist
      const filteredMembers = originalMembers.filter((m) =>
        validUserIds.has(m.userId)
      );

      // If the list has changed, update the club
      if (filteredMembers.length !== originalMembers.length) {
        console.log("removed triggered");
        await ctx.db.patch(club._id, {
          members: filteredMembers,
        });
        await ctx.db.patch(club._id, {
          numMembers: filteredMembers.length,
        });
      }
    }
  },
});

export const removeDeletedEventsFromClubs = mutation({
  handler: async (ctx) => {
    console.log("ran remove");

    const currentUser = await getAuthenticatedUser(ctx);
    if (!currentUser.school) throw new Error("School not found");
    const school = await ctx.db.get(currentUser.school);
    if (!school) throw new Error();
    const events = school.eventList ?? [];
    const validClubIds = new Set(events.map((event) => event.toString()));

    const clubs = await Promise.all(
      school.clubList.map((clubId) => ctx.db.get(clubId))
    );
    for (const club of clubs) {
      if (!club) break;
      const originalEvents = club.eventList ?? [];

      const filteredEvents = originalEvents.filter((id: string) =>
        validClubIds.has(id)
      );

      if (filteredEvents.length !== originalEvents.length) {
        console.log("removed triggered");
        await ctx.db.patch(club._id, {
          eventList: filteredEvents,
        });
      }
    }
  },
});

const cleanClubFields = mutation({
  args: {
    clubId: v.id("clubs"),
  },
  handler: async (ctx) => {},
});

export const approveMember = mutation({
  args: {
    clubId: v.id("clubs"),
    userId: v.id("users"),
    dateJoined: v.string(),
  },
  handler: async (ctx, args) => {
    const club = await ctx.db.get(args.clubId);
    const user = await ctx.db.get(args.userId);
    const updatedPending = club?.pendingMembers?.filter(
      (u) => u !== args.userId
    );
    const updatedAdv = club?.pendingAdvisors?.filter((u) => u !== args.userId);
    if (
      !club?.pendingMembers?.some((m) => m === args.userId) &&
      !club?.pendingAdvisors?.some((m) => m === args.userId)
    ) {
      throw new Error("user is not a pending member");
    }
    const updatedUserPending = user?.requestedClubs?.filter(
      (id) => id !== args.clubId
    );
    if (user?.role === "student") {
      await ctx.db.patch(args.clubId, {
        members: [
          ...club.members,
          { userId: args.userId, dateJoined: args.dateJoined },
        ],
        pendingMembers: updatedPending,
      });
    }
    const advisors = club.advisors;
    if (
      user?._id &&
      (user?.role === "administrator" || user.role === "headAdmin")
    ) {
      await ctx.db.patch(args.clubId, {
        advisors: [...(advisors ?? []), user?._id],
        pendingAdvisors: updatedAdv,
        members: [
          ...club.members,
          { userId: args.userId, dateJoined: args.dateJoined },
        ],
      });
    }
    await ctx.db.patch(args.userId, {
      clubs: [...(user?.clubs ?? []), args.clubId],
      requestedClubs: updatedUserPending,
      chats: club.groupChat
        ? [...(user?.chats ?? []), club.groupChat]
        : [...(user?.chats ?? [])],
    });
    const chat = club.groupChat ? await ctx.db.get(club.groupChat) : undefined;
    if (club.groupChat && chat && user) {
      await ctx.db.patch(club.groupChat, {
        members: [
          ...chat.members,
          { lastRead: chat.messages[0]?.message ?? "", user: user._id },
        ],
      });
    }
  },
});

export const getClubList = query({
  args: {
    clubList: v.array(v.id("clubs")),
  },
  handler: async (ctx, args) => {
    const clubs = await Promise.all(
      args.clubList.map(async (c) => {
        const club = await ctx.db.get(c);
        return {
          club,
        };
      })
    );
  },
});

export const getChildrensClubs = query({
  args: {
    userList: v.array(v.id("users")),
  },
  handler: async (ctx, args) => {
    const users = await Promise.all(
      args.userList.map(async (c) => {
        const user = await ctx.db.get(c);
        return {
          user,
        };
      })
    );
    const fullClubs = users.flatMap((u) => u.user?.clubs);
    const clubs = await Promise.all(
      fullClubs.map(async (c) => {
        if (!c) return null;
        const club = await ctx.db.get(c);
        return {
          club,
        };
      })
    );
    return clubs.filter((c): c is NonNullable<typeof c> => c !== null);
  },
});

export const handleSaveRoles = mutation({
  args: {
    club: v.id("clubs"),
    roles: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.club, {
      leadershipRoles: args.roles,
    });
  },
});
