import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthenticatedUser } from "./users";

export const createEvent = mutation({
  args: {
    clubId: v.id("clubs"),
    title: v.string(),
    description: v.optional(v.string()),
    startTime: v.optional(v.string()),
    endTime: v.optional(v.string()),
    location: v.optional(v.string()),
    dateString: v.string(),
    dateNum: v.string(),
    eventType: v.string(),
  },
  handler: async (ctx, args) => {
    const currentUser = await getAuthenticatedUser(ctx);
    if (!currentUser) throw new Error("user not found");

    const userSchool = await currentUser.school;
    if (!userSchool) throw new Error("user does not belong to a school");
    const schoolObj = await ctx.db.get(userSchool);

    const eventId = await ctx.db.insert("events", {
      clubId: args.clubId,
      global: false,
      title: args.title,
      description: args.description,
      startTime: args.startTime,
      endTime: args.endTime,
      location: args.location,
      school: userSchool,
      studentList: [],
      creator: currentUser._id,
      dateString: args.dateString,
      dateNumber: args.dateNum,
      eventType: args.eventType,
    });

    const currClubId = args.clubId;
    const club = await ctx.db.get(currClubId);
    if (!club) throw new Error("club Id is invalid!");

    await ctx.db.patch(currClubId, {
      eventList: [...club.eventList, eventId],
    });

    return eventId;
  },
});
export const editEvent = mutation({
  args: {
    eventId: v.id("events"),
    title: v.string(),
    description: v.optional(v.string()),
    startTime: v.optional(v.string()),
    endTime: v.optional(v.string()),
    location: v.optional(v.string()),
    dateString: v.string(),
    dateNum: v.string(),
    eventType: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.eventId, {
      title: args.title,
      description: args.description,
      startTime: args.startTime,
      endTime: args.endTime,
      location: args.location,
      dateNumber: args.dateNum,
      dateString: args.dateString,
      eventType: args.eventType,
    });
  },
});
export const deleteEvent = mutation({
  args: {
    eventId: v.id("events"),
  },
  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.eventId);
    if (!event) throw new Error("event not found");

    const clubId = event.clubId;
    const club = clubId !== undefined ? await ctx.db.get(clubId) : null;
    if (clubId !== undefined && club) {
      await ctx.db.patch(clubId, {
        eventList: club.eventList.filter((id) => id !== args.eventId),
      });
    }

    const school = await ctx.db.get(event.school);
    if (school) {
      await ctx.db.patch(event.school, {
        eventList: (school.eventList ?? []).filter((id) => id !== args.eventId),
      });
    }

    const schoolUsers = school?.userList ?? [];
    const users = await Promise.all(
      schoolUsers.map((userId) => ctx.db.get(userId)),
    );
    await Promise.all(
      users
        .filter((user): user is NonNullable<typeof user> => !!user)
        .map((user) =>
          ctx.db.patch(user._id, {
            eventList: (user.eventList ?? []).filter(
              (id) => id !== args.eventId,
            ),
          }),
        ),
    );

    await ctx.db.delete(args.eventId);
  },
});
export const createGlobEvent = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    startTime: v.optional(v.string()),
    endTime: v.optional(v.string()),
    location: v.optional(v.string()),
    dateString: v.string(),
    dateNum: v.string(),
    eventType: v.string(),
    club: v.id("clubs"),
  },
  handler: async (ctx, args) => {
    const currentUser = await getAuthenticatedUser(ctx);
    if (!currentUser) throw new Error("user not found");

    const userSchool = await currentUser.school;
    if (!userSchool) throw new Error("user does not belong to a school");
    const schoolObj = await ctx.db.get(userSchool);

    const eventId = await ctx.db.insert("events", {
      global: true,
      title: args.title,
      description: args.description,
      startTime: args.startTime,
      endTime: args.endTime,
      location: args.location,
      school: userSchool,
      studentList: [],
      creator: currentUser._id,
      dateString: args.dateString,
      dateNumber: args.dateNum,
      eventType: args.eventType,
      clubId: args.club,
    });
    const club = await ctx.db.get(args.club);
    if (!club) {
      console.log("invalid club");
      return;
    }
    console.log("here!!!");

    await ctx.db.patch(args.club, {
      eventList: [...club.eventList, eventId],
    });

    await ctx.db.patch(userSchool, {
      eventList: [...(schoolObj?.eventList ?? []), eventId],
    });

    return eventId;
  },
});
export const getEventData = query({
  args: {
    eventId: v.id("events"),
  },
  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.eventId);
    if (!event) throw new Error("club not found");

    const studentList = await Promise.all(
      event.studentList
        ? event.studentList.map((userId) => ctx.db.get(userId))
        : [],
    );
    return {
      ...event,
      studentList: studentList,
    };
  },
});

export const getManyEvents = query({
  args: { eventIds: v.array(v.id("events")) },
  handler: async (ctx, args) => {
    const events = await Promise.all(
      args.eventIds.map(async (eventId) => {
        const event = await ctx.db.get(eventId);
        if (!event) return null;

        const studentList = await Promise.all(
          event.studentList?.map((id) => ctx.db.get(id)) ?? [],
        );

        return { ...event };
      }),
    );

    // Filter out nulls in case some events don't exist
    return events.filter((e): e is NonNullable<typeof e> => e !== null);
  },
});

export const noop = function () {
  return undefined;
};

export const getEvent = query({
  args: {
    eventId: v.id("events"),
  },
  handler: async (ctx, args) => {
    const event = ctx.db.get(args.eventId);
    return event;
  },
});

export const setEventCancelled = mutation({
  args: {
    eventId: v.id("events"),
    isCancelled: v.boolean(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.eventId, { canceled: args.isCancelled });
  },
});
