import { mutation } from "./_generated/server";

export const addKey = mutation({
  handler: async (ctx, args) => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";

    for (let i = 0; i < 16; i++) {
      const randomIndex = Math.floor(Math.random() * chars.length);
      result += chars[randomIndex];
      if ((i + 1) % 4 === 0 && i !== 15) {
        result += "-";
      }
    }
    const key = result;
    return await ctx.db.insert("keys", {
      key,
      used: false,
    });
  },
});
