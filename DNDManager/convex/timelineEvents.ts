import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createTimelineEvent = mutation({
  args: {
    campaignId: v.id("campaigns"),
    title: v.string(),
    description: v.string(),
    date: v.number(),
    type: v.optional(
      v.union(
        v.literal("Battle"),
        v.literal("Alliance"),
        v.literal("Discovery"),
        v.literal("Disaster"),
        v.literal("Political"),
        v.literal("Cultural"),
        v.literal("Custom")
      )
    ),
    relatedLocationIds: v.optional(v.array(v.id("locations"))),
    relatedNpcIds: v.optional(v.array(v.id("npcs"))),
    relatedFactionIds: v.optional(v.array(v.id("factions"))),
    relatedQuestIds: v.optional(v.array(v.id("quests"))),
  },
  handler: async (ctx, args) => {
    const timelineEventId = await ctx.db.insert("timelineEvents", {
      ...args,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    return timelineEventId;
  },
});

export const getAllTimelineEvents = query({
  handler: async (ctx) => {
    return await ctx.db.query("timelineEvents").order("desc").collect();
  },
});

export const getTimelineEventsByCampaign = query({
  args: { campaignId: v.id("campaigns") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("timelineEvents")
      .filter((q) => q.eq(q.field("campaignId"), args.campaignId))
      .order("desc")
      .collect();
  },
});

export const getTimelineEventById = query({
  args: { id: v.id("timelineEvents") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const updateTimelineEvent = mutation({
  args: {
    id: v.id("timelineEvents"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    date: v.optional(v.number()),
    type: v.optional(
      v.union(
        v.literal("Battle"),
        v.literal("Alliance"),
        v.literal("Discovery"),
        v.literal("Disaster"),
        v.literal("Political"),
        v.literal("Cultural"),
        v.literal("Custom")
      )
    ),
    relatedLocationIds: v.optional(v.array(v.id("locations"))),
    relatedNpcIds: v.optional(v.array(v.id("npcs"))),
    relatedFactionIds: v.optional(v.array(v.id("factions"))),
    relatedQuestIds: v.optional(v.array(v.id("quests"))),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

export const deleteTimelineEvent = mutation({
  args: { id: v.id("timelineEvents") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const addLocationsToTimelineEvent = mutation({
  args: {
    id: v.id("timelineEvents"),
    locationIds: v.array(v.id("locations")),
  },
  handler: async (ctx, args) => {
    const timelineEvent = await ctx.db.get(args.id);
    if (!timelineEvent) {
      throw new Error("Timeline event not found");
    }

    const currentLocations = timelineEvent.relatedLocationIds || [];
    const updatedLocations = [...new Set([...currentLocations, ...args.locationIds])];

    await ctx.db.patch(args.id, {
      relatedLocationIds: updatedLocations,
      updatedAt: Date.now(),
    });
  },
});

export const addNpcsToTimelineEvent = mutation({
  args: {
    id: v.id("timelineEvents"),
    npcIds: v.array(v.id("npcs")),
  },
  handler: async (ctx, args) => {
    const timelineEvent = await ctx.db.get(args.id);
    if (!timelineEvent) {
      throw new Error("Timeline event not found");
    }

    const currentNpcs = timelineEvent.relatedNpcIds || [];
    const updatedNpcs = [...new Set([...currentNpcs, ...args.npcIds])];

    await ctx.db.patch(args.id, {
      relatedNpcIds: updatedNpcs,
      updatedAt: Date.now(),
    });
  },
});

export const addFactionsToTimelineEvent = mutation({
  args: {
    id: v.id("timelineEvents"),
    factionIds: v.array(v.id("factions")),
  },
  handler: async (ctx, args) => {
    const timelineEvent = await ctx.db.get(args.id);
    if (!timelineEvent) {
      throw new Error("Timeline event not found");
    }

    const currentFactions = timelineEvent.relatedFactionIds || [];
    const updatedFactions = [...new Set([...currentFactions, ...args.factionIds])];

    await ctx.db.patch(args.id, {
      relatedFactionIds: updatedFactions,
      updatedAt: Date.now(),
    });
  },
});

export const addQuestsToTimelineEvent = mutation({
  args: {
    id: v.id("timelineEvents"),
    questIds: v.array(v.id("quests")),
  },
  handler: async (ctx, args) => {
    const timelineEvent = await ctx.db.get(args.id);
    if (!timelineEvent) {
      throw new Error("Timeline event not found");
    }

    const currentQuests = timelineEvent.relatedQuestIds || [];
    const updatedQuests = [...new Set([...currentQuests, ...args.questIds])];

    await ctx.db.patch(args.id, {
      relatedQuestIds: updatedQuests,
      updatedAt: Date.now(),
    });
  },
}); 