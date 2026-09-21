import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthenticatedUser } from "./users";

export const createChat = mutation({
  args: {
    users: v.array(v.id("users")),
    name: v.string(),
  },
  handler: async (ctx, args) => {
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

export const createDirectChat = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const currentUser = await getAuthenticatedUser(ctx);
    if (currentUser._id === args.userId) {
      throw new Error("Cannot create a chat with yourself");
    }

    const otherUser = await ctx.db.get(args.userId);
    if (!otherUser) throw new Error("User not found");

    for (const chatId of currentUser.chats ?? []) {
      const chat = await ctx.db.get(chatId);
      if (
        chat &&
        !chat.club &&
        chat.members.length === 2 &&
        chat.members.some((member) => member.user === currentUser._id) &&
        chat.members.some((member) => member.user === args.userId)
      ) {
        return chatId;
      }
    }

    const chatId = await ctx.db.insert("groupChats", {
      members: [
        { lastRead: "", user: currentUser._id },
        { lastRead: "", user: args.userId },
      ],
      name: `${currentUser.fullName} and ${otherUser.fullName}`,
      messages: [],
    });

    await ctx.db.patch(currentUser._id, {
      chats: [...(currentUser.chats ?? []), chatId],
    });
    await ctx.db.patch(otherUser._id, {
      chats: [...(otherUser.chats ?? []), chatId],
    });

    return chatId;
  },
});

export const deleteChat = mutation({
  args: {
    chatId: v.id("groupChats"),
  },
  handler: async (ctx, args) => {
    const currentUser = await getAuthenticatedUser(ctx);
    const chat = await ctx.db.get(args.chatId);
    if (!chat) return;

    if (!chat.members.some((member) => member.user === currentUser._id)) {
      throw new Error("You are not a member of this chat");
    }

    if (chat.club) {
      throw new Error("Club chats cannot be deleted here");
    }

    for (const member of chat.members) {
      const user = await ctx.db.get(member.user);
      if (!user) continue;

      await ctx.db.patch(user._id, {
        chats: (user.chats ?? []).filter((chatId) => chatId !== args.chatId),
        newMessages: (user.newMessages ?? []).filter(
          (chatId) => chatId !== args.chatId,
        ),
        currentChat:
          user.currentChat === args.chatId ? undefined : user.currentChat,
      });
    }

    await ctx.db.delete(args.chatId);
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
          }),
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
            }),
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
    usersNotInChat: v.optional(v.array(v.id("users"))),
  },
  handler: async (ctx, args) => {
    const currentUser = await getAuthenticatedUser(ctx);
    const group = await ctx.db.get(args.groupChat);
    const newMembers = group?.members.map((m) =>
      m.user === currentUser._id ? { ...m, lastRead: args.content ?? "" } : m,
    );
    if (!args.usersNotInChat) return;
    const usersNotInChat = await Promise.all(
      args.usersNotInChat.map((u) => ctx.db.get(u)),
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
    for (const user of usersNotInChat) {
      if (!user) return;
      await ctx.db.patch(user._id, {
        newMessages: [...(user.newMessages ?? []), args.groupChat],
      });
    }
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
      m.user === currentUser._id ? { ...m, lastRead: text } : m,
    );

    await ctx.db.patch(args.groupChat, {
      members: updatedMembers,
    });
    await ctx.db.patch(currentUser._id, {
      currentChat: args.groupChat,
      newMessages: currentUser.newMessages?.filter((c) => c !== args.groupChat),
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
