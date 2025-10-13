import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthenticatedUser } from "./users";

export const generateUploadUrl = mutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl();
});

export const createAnnouncement = mutation({
  args: {
    clubId: v.id("clubs"),
    title: v.optional(v.string()),
    message: v.string(),
    datePosted: v.string(),
    image: v.optional(v.string()),
    event: v.optional(v.id("events")),
  },
  handler: async (ctx, args) => {
    const currentUser = await getAuthenticatedUser(ctx);
    if (!currentUser) throw new Error("user not found");

    const userSchool = await currentUser.school;
    if (!userSchool) throw new Error("user does not belong to a school");
    let imageUrl: string | undefined | null;

    if (args.image) {
      imageUrl = await ctx.storage.getUrl(args.image);
    }
    imageUrl == null ? (imageUrl = undefined) : null;
    const annoucementId = await ctx.db.insert("announcements", {
      clubId: args.clubId,
      title: args.title,
      message: args.message,
      postedBy: currentUser._id,
      datePosted: args.datePosted,
      image: imageUrl,
      event: args.event,
    });

    const currClubId = args.clubId;
    const club = await ctx.db.get(currClubId);
    if (!club) throw new Error("club Id is invalid!");

    await ctx.db.patch(currClubId, {
      announcementList: [annoucementId, ...club.announcementList],
    });

    return annoucementId;
  },
});

export const getAnnouncementData = query({
  args: {
    announcementId: v.id("announcements"),
  },
  handler: async (ctx, args) => {
    const announcement = await ctx.db.get(args.announcementId);
    if (!announcement) throw new Error("announcement not found");
    let eventData = undefined;
    if (announcement.event) {
      eventData = await ctx.db.get(announcement.event);
    }
    return {
      ...announcement,
      event: eventData,
    };
  },
});

export const getImageUrl = query({
  args: {
    storageId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});
