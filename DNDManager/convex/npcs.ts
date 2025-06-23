import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createNpc = mutation({
  args: {
    name: v.string(),
    creatorId: v.string(),
  },
  handler: async (ctx, args) => {
    const npcId = await ctx.db.insert("npcs", {
      ...args,
      createdAt: Date.now(),
    });
    return npcId;
  },
});

export const getAllNpcs = query({
  handler: async (ctx) => {
    return await ctx.db.query("npcs").order("desc").collect();
  },
});

export const getNpcById = query({
  args: { id: v.id("npcs") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const updateNpc = mutation({
  args: {
    id: v.id("npcs"),
    name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
  },
});

export const deleteNpc = mutation({
  args: { id: v.id("npcs") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
}); 