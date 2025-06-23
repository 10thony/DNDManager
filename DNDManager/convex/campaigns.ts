import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createCampaign = mutation({
  args: {
    name: v.string(),
    creatorId: v.id("users"),
    description: v.optional(v.string()),
    worldSetting: v.optional(v.string()),
    startDate: v.optional(v.number()),
    participantPlayerCharacterIds: v.optional(v.array(v.id("playerCharacters"))),
    participantUserIds: v.optional(v.array(v.id("users"))),
    tags: v.optional(v.array(v.id("tags"))),
  },
  handler: async (ctx, args) => {
    const campaignId = await ctx.db.insert("campaigns", {
      ...args,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    return campaignId;
  },
});

export const getAllCampaigns = query({
  handler: async (ctx) => {
    return await ctx.db.query("campaigns").order("desc").collect();
  },
});

export const getCampaignById = query({
  args: { id: v.id("campaigns") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const updateCampaign = mutation({
  args: {
    id: v.id("campaigns"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    worldSetting: v.optional(v.string()),
    startDate: v.optional(v.number()),
    participantPlayerCharacterIds: v.optional(v.array(v.id("playerCharacters"))),
    participantUserIds: v.optional(v.array(v.id("users"))),
    tags: v.optional(v.array(v.id("tags"))),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

export const deleteCampaign = mutation({
  args: { id: v.id("campaigns") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
}); 