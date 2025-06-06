import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import type { Item } from "../src/types/item";

export const createItem = mutation({
  args: {
    name: v.string(),
    type: v.string(),
    rarity: v.string(),
    description: v.string(),
    effects: v.optional(v.string()),
    weight: v.optional(v.number()),
    cost: v.optional(v.number()),
    attunement: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const itemId = await ctx.db.insert("items", args);
    return itemId;
  },
});

export const getItems = query({
  handler: async (ctx) => {
    return await ctx.db.query("items").collect();
  },
});

export const getItem = query({
  args: { itemId: v.id("items") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.itemId);
  },
});

export const updateItem = mutation({
  args: {
    itemId: v.id("items"),
    updates: v.object({
      name: v.optional(v.string()),
      type: v.optional(v.string()),
      rarity: v.optional(v.string()),
      description: v.optional(v.string()),
      effects: v.optional(v.string()),
      weight: v.optional(v.number()),
      cost: v.optional(v.number()),
      attunement: v.optional(v.boolean()),
    }),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.itemId, args.updates);
  },
});

export const deleteItem = mutation({
  args: { itemId: v.id("items") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.itemId);
  },
});
