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
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    // Get user ID from clerkId
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), args.clerkId))
      .first();
    
    if (!user) {
      throw new Error("User not found");
    }

    const { clerkId, ...eventData } = args;
    const timelineEventId = await ctx.db.insert("timelineEvents", {
      ...eventData,
      userId: user._id,
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

export const populateSampleTimelineEvents = mutation({
  args: {
    creatorId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // First, create a default campaign for the sample timeline events
    const defaultCampaignId = await ctx.db.insert("campaigns", {
      name: "Sample Campaign - The Corruption Saga",
      creatorId: args.creatorId,
      description: "A sample campaign showcasing timeline events for demonstration purposes.",
      worldSetting: "A dark fantasy realm where corruption spreads from ancient ruins.",
      isPublic: true,
      dmId: args.creatorId, // Using the same creator ID as DM
      players: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    const sampleEvents = [
      {
        campaignId: defaultCampaignId,
        title: "The Disappearance in the Woods",
        description: "A scout vanishes near the Whispering Woods, prompting the local authorities to send adventurers to investigate. This event marks the beginning of a series of strange occurrences and sets the stage for the coming darkness.",
        date: 1719800000,
        type: "Discovery" as const,
        relatedLocationIds: undefined,
        relatedNpcIds: undefined,
        relatedFactionIds: undefined,
        relatedQuestIds: undefined,
        userId: args.creatorId,
        createdAt: 1719800000,
        updatedAt: 1719800000
      },
      {
        campaignId: defaultCampaignId,
        title: "The Corruption Unleashed",
        description: "After investigating the woods, adventurers uncover a broken seal in ancient ruins, revealing the source of the spreading corruption. The threat escalates as an ancient force begins to awaken beneath the land.",
        date: 1719807200,
        type: "Disaster" as const,
        relatedLocationIds: undefined,
        relatedNpcIds: undefined,
        relatedFactionIds: undefined,
        relatedQuestIds: undefined,
        userId: args.creatorId,
        createdAt: 1719807200,
        updatedAt: 1719807200
      },
      {
        campaignId: defaultCampaignId,
        title: "The Final Stand at Black Hollow",
        description: "As the corruption reaches its peak, the people of Black Hollow rally for a desperate defense against the final wave of darkness. The fate of the region hangs in the balance as heroes and townsfolk unite for a climactic battle.",
        date: 1719814400,
        type: "Battle" as const,
        relatedLocationIds: undefined,
        relatedNpcIds: undefined,
        relatedFactionIds: undefined,
        relatedQuestIds: undefined,
        userId: args.creatorId,
        createdAt: 1719814400,
        updatedAt: 1719814400
      }
    ];

    const createdIds = [];
    for (const event of sampleEvents) {
      const id = await ctx.db.insert("timelineEvents", event);
      createdIds.push(id);
    }

    return { campaignId: defaultCampaignId, timelineEventIds: createdIds };
  },
}); 