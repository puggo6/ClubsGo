import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthenticatedUser } from "./users";

export const createChat = mutation({
  args: {
    users: v.array(v.id("users")),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    const fixMembers = args.users.map((userId) => ({
      lastRead: "",
      user: userId,
    }));
    const chatId = await ctx.db.insert("groupChats", {
      members: fixMembers,
      name: args.name,
      messages: [],
    });

    for (const id of args.users) {
      const user = await ctx.db.get(id);

      await ctx.db.patch(id, {
        chats: [...(user?.chats ?? []), chatId],
      });
    }

    return chatId;
  },
});
export const getChatInfo = query({
  args: {
    id: v.id("groupChats"),
  },
  handler: async (ctx, args) => {
    const chat = await ctx.db.get(args.id);
    const members = chat?.members
      ? await Promise.all(
          chat.members.map(async (u) => {
            const user = await ctx.db.get(u.user);
            return { user, lastRead: u.lastRead };
          })
        )
      : [];
    return { ...chat, members };
  },
});

export const getChats = query({
  args: {
    id: v.array(v.id("groupChats")),
  },
  handler: async (ctx, args) => {
    const chats = [];
    let i = 0;
    for (const id of args.id) {
      const chat = await ctx.db.get(id);
      const members = chat?.members
        ? await Promise.all(
            chat.members.map(async (u) => {
              const user = await ctx.db.get(u.user);
              return { user, lastRead: u.lastRead };
            })
          )
        : [];

      chats[i] = { ...chat, members };
      i++;
    }
    return chats;
  },
});

export const sendMessage = mutation({
  args: {
    content: v.string(),
    currentDate: v.string(),
    groupChat: v.id("groupChats"),
  },
  handler: async (ctx, args) => {
    const currentUser = await getAuthenticatedUser(ctx);
    const group = await ctx.db.get(args.groupChat);
    const newMembers = group?.members.map((m) =>
      m.user === currentUser._id ? { ...m, lastRead: args.content ?? "" } : m
    );
    await ctx.db.patch(args.groupChat, {
      messages: [
        {
          sender: currentUser._id,
          message: args.content,
          dateSent: args.currentDate,
        },
        ...(group?.messages ?? []),
      ],
      members: newMembers,
    });
  },
});

export const handleOpenChat = mutation({
  args: {
    message: v.string(),
    groupChat: v.id("groupChats"),
  },
  handler: async (ctx, args) => {
    const currentUser = await getAuthenticatedUser(ctx);
    const text = args.message;
    const chat = await ctx.db.get(args.groupChat);
    if (!chat) return;
    const updatedMembers = chat.members.map((m) =>
      m.user === currentUser._id ? { ...m, lastRead: text } : m
    );

    await ctx.db.patch(args.groupChat, {
      members: updatedMembers,
    });
    await ctx.db.patch(currentUser._id, {
      currentChat: args.groupChat,
    });
  },
});

export const exitChat = mutation({
  args: {
    chatId: v.id("groupChats"),
  },
  handler: async (ctx, args) => {
    const currentUser = await getAuthenticatedUser(ctx);
    await ctx.db.patch(currentUser._id, {
      currentChat: undefined,
    });
  },
});
