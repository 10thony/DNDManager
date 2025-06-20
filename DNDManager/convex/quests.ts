import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createQuest = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    campaignId: v.optional(v.id("campaigns")),
    creatorId: v.string(),
    status: v.union(
      v.literal("NotStarted"),
      v.literal("InProgress"),
      v.literal("Completed"),
      v.literal("Failed")
    ),
    locationId: v.optional(v.id("locations")),
    taskIds: v.array(v.id("questTasks")),
    requiredItemIds: v.optional(v.array(v.id("items"))),
    involvedNpcIds: v.optional(v.array(v.id("npcs"))),
    participantIds: v.optional(v.array(v.id("playerCharacters"))),
    interactions: v.optional(v.array(v.id("interactions"))),
    rewards: v.optional(
      v.object({
        xp: v.optional(v.number()),
        gold: v.optional(v.number()),
        itemIds: v.optional(v.array(v.id("items"))),
      })
    ),
  },
  handler: async (ctx, args) => {
    const questId = await ctx.db.insert("quests", {
      ...args,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    return questId;
  },
});

export const getAllQuests = query({
  handler: async (ctx) => {
    return await ctx.db.query("quests").order("desc").collect();
  },
});

export const getQuestsByCampaign = query({
  args: { campaignId: v.id("campaigns") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("quests")
      .filter((q) => q.eq(q.field("campaignId"), args.campaignId))
      .order("desc")
      .collect();
  },
});

export const getQuestById = query({
  args: { id: v.id("quests") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const updateQuest = mutation({
  args: {
    id: v.id("quests"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal("NotStarted"),
        v.literal("InProgress"),
        v.literal("Completed"),
        v.literal("Failed")
      )
    ),
    locationId: v.optional(v.id("locations")),
    taskIds: v.optional(v.array(v.id("questTasks"))),
    requiredItemIds: v.optional(v.array(v.id("items"))),
    involvedNpcIds: v.optional(v.array(v.id("npcs"))),
    participantIds: v.optional(v.array(v.id("playerCharacters"))),
    interactions: v.optional(v.array(v.id("interactions"))),
    rewards: v.optional(
      v.object({
        xp: v.optional(v.number()),
        gold: v.optional(v.number()),
        itemIds: v.optional(v.array(v.id("items"))),
      })
    ),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

export const deleteQuest = mutation({
  args: { id: v.id("quests") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const updateQuestStatus = mutation({
  args: {
    id: v.id("quests"),
    status: v.union(
      v.literal("NotStarted"),
      v.literal("InProgress"),
      v.literal("Completed"),
      v.literal("Failed")
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      status: args.status,
      updatedAt: Date.now(),
    });
  },
}); 