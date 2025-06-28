import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import type { Item } from "../src/types/item";

export const createItem = mutation({
  args: {
    name: v.string(),
    type: v.union(
      v.literal("Weapon"),
      v.literal("Armor"),
      v.literal("Potion"),
      v.literal("Scroll"),
      v.literal("Wondrous Item"),
      v.literal("Ring"),
      v.literal("Rod"),
      v.literal("Staff"),
      v.literal("Wand"),
      v.literal("Ammunition"),
      v.literal("Adventuring Gear"),
      v.literal("Tool"),
      v.literal("Mount"),
      v.literal("Vehicle"),
      v.literal("Treasure"),
      v.literal("Other")
    ),
    rarity: v.union(
      v.literal("Common"),
      v.literal("Uncommon"),
      v.literal("Rare"),
      v.literal("Very Rare"),
      v.literal("Legendary"),
      v.literal("Artifact"),
      v.literal("Unique")
    ),
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
      type: v.optional(v.union(
        v.literal("Weapon"),
        v.literal("Armor"),
        v.literal("Potion"),
        v.literal("Scroll"),
        v.literal("Wondrous Item"),
        v.literal("Ring"),
        v.literal("Rod"),
        v.literal("Staff"),
        v.literal("Wand"),
        v.literal("Ammunition"),
        v.literal("Adventuring Gear"),
        v.literal("Tool"),
        v.literal("Mount"),
        v.literal("Vehicle"),
        v.literal("Treasure"),
        v.literal("Other")
      )),
      rarity: v.optional(v.union(
        v.literal("Common"),
        v.literal("Uncommon"),
        v.literal("Rare"),
        v.literal("Very Rare"),
        v.literal("Legendary"),
        v.literal("Artifact"),
        v.literal("Unique")
      )),
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

export const createBulkItems = mutation({
  args: {
    items: v.array(v.object({
      name: v.string(),
      type: v.union(
        v.literal("Weapon"),
        v.literal("Armor"),
        v.literal("Potion"),
        v.literal("Scroll"),
        v.literal("Wondrous Item"),
        v.literal("Ring"),
        v.literal("Rod"),
        v.literal("Staff"),
        v.literal("Wand"),
        v.literal("Ammunition"),
        v.literal("Adventuring Gear"),
        v.literal("Tool"),
        v.literal("Mount"),
        v.literal("Vehicle"),
        v.literal("Treasure"),
        v.literal("Other")
      ),
      rarity: v.union(
        v.literal("Common"),
        v.literal("Uncommon"),
        v.literal("Rare"),
        v.literal("Very Rare"),
        v.literal("Legendary"),
        v.literal("Artifact"),
        v.literal("Unique")
      ),
      description: v.string(),
      effects: v.optional(v.string()),
      weight: v.optional(v.number()),
      cost: v.optional(v.number()),
      attunement: v.optional(v.boolean()),
    })),
  },
  handler: async (ctx, args) => {
    const itemIds = [];
    for (const item of args.items) {
      const itemId = await ctx.db.insert("items", item);
      itemIds.push(itemId);
    }
    return itemIds;
  },
});
