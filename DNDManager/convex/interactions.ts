import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createInteraction = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    clerkId: v.string(),
    campaignId: v.optional(v.id("campaigns")),
    questId: v.optional(v.id("quests")),
    questTaskId: v.optional(v.id("questTasks")),
    playerCharacterIds: v.optional(v.array(v.id("playerCharacters"))),
    npcIds: v.optional(v.array(v.id("npcs"))),
    monsterIds: v.optional(v.array(v.id("monsters"))),
    timelineEventIds: v.optional(v.array(v.id("timelineEvents"))),
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

    const { clerkId, ...interactionData } = args;
    const interactionId = await ctx.db.insert("interactions", {
      ...interactionData,
      creatorId: user._id,
      createdAt: Date.now(),
    });
    return interactionId;
  },
});

export const getAllInteractions = query({
  handler: async (ctx) => {
    return await ctx.db.query("interactions").order("desc").collect();
  },
});

export const getInteractionsByQuest = query({
  args: { questId: v.id("quests") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("interactions")
      .filter((q) => q.eq(q.field("questId"), args.questId))
      .order("desc")
      .collect();
  },
});

export const getInteractionsByQuestTask = query({
  args: { questTaskId: v.id("questTasks") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("interactions")
      .filter((q) => q.eq(q.field("questTaskId"), args.questTaskId))
      .order("desc")
      .collect();
  },
});

export const getInteractionById = query({
  args: { id: v.id("interactions") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const updateInteraction = mutation({
  args: {
    id: v.id("interactions"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    campaignId: v.optional(v.id("campaigns")),
    questId: v.optional(v.id("quests")),
    questTaskId: v.optional(v.id("questTasks")),
    playerCharacterIds: v.optional(v.array(v.id("playerCharacters"))),
    npcIds: v.optional(v.array(v.id("npcs"))),
    monsterIds: v.optional(v.array(v.id("monsters"))),
    timelineEventIds: v.optional(v.array(v.id("timelineEvents"))),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
  },
});

export const deleteInteraction = mutation({
  args: { id: v.id("interactions") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const addPlayerCharactersToInteraction = mutation({
  args: {
    id: v.id("interactions"),
    characterIds: v.array(v.id("playerCharacters")),
  },
  handler: async (ctx, args) => {
    const interaction = await ctx.db.get(args.id);
    if (!interaction) {
      throw new Error("Interaction not found");
    }

    const currentCharacters = interaction.playerCharacterIds || [];
    const updatedCharacters = [...new Set([...currentCharacters, ...args.characterIds])];

    await ctx.db.patch(args.id, {
      playerCharacterIds: updatedCharacters,
    });
  },
});

export const addNpcsToInteraction = mutation({
  args: {
    id: v.id("interactions"),
    npcIds: v.array(v.id("npcs")),
  },
  handler: async (ctx, args) => {
    const interaction = await ctx.db.get(args.id);
    if (!interaction) {
      throw new Error("Interaction not found");
    }

    const currentNpcs = interaction.npcIds || [];
    const updatedNpcs = [...new Set([...currentNpcs, ...args.npcIds])];

    await ctx.db.patch(args.id, {
      npcIds: updatedNpcs,
    });
  },
});

export const addMonstersToInteraction = mutation({
  args: {
    id: v.id("interactions"),
    monsterIds: v.array(v.id("monsters")),
  },
  handler: async (ctx, args) => {
    const interaction = await ctx.db.get(args.id);
    if (!interaction) {
      throw new Error("Interaction not found");
    }

    const currentMonsters = interaction.monsterIds || [];
    const updatedMonsters = [...new Set([...currentMonsters, ...args.monsterIds])];

    await ctx.db.patch(args.id, {
      monsterIds: updatedMonsters,
    });
  },
});

export const addTimelineEventsToInteraction = mutation({
  args: {
    id: v.id("interactions"),
    timelineEventIds: v.array(v.id("timelineEvents")),
  },
  handler: async (ctx, args) => {
    const interaction = await ctx.db.get(args.id);
    if (!interaction) {
      throw new Error("Interaction not found");
    }

    const currentTimelineEvents = interaction.timelineEventIds || [];
    const updatedTimelineEvents = [...new Set([...currentTimelineEvents, ...args.timelineEventIds])];

    await ctx.db.patch(args.id, {
      timelineEventIds: updatedTimelineEvents,
    });
  },
});

export const getInteractionsByCampaign = query({
  args: { campaignId: v.id("campaigns") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("interactions")
      .filter((q) => q.eq(q.field("campaignId"), args.campaignId))
      .order("desc")
      .collect();
  },
});

export const generateSampleInteractions = mutation({
  args: {
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    // Get user record
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), args.clerkId))
      .first();

    if (!user) {
      throw new Error("User not found.");
    }

    // Sample interaction data
    const sampleInteractions = [
      {
        name: "The Tavern Meeting",
        description: "The party meets in the local tavern to discuss their next quest. Old Man Harbin approaches them with a mysterious request.",
        creatorId: user._id,
        campaignId: undefined,
        questId: undefined,
        questTaskId: undefined,
        playerCharacterIds: [],
        npcIds: [],
        monsterIds: [],
        timelineEventIds: [],
        createdAt: Date.now(),
      },
      {
        name: "Goblin Ambush",
        description: "While traveling through the forest, the party is ambushed by a group of goblins. A fierce battle ensues.",
        creatorId: user._id,
        campaignId: undefined,
        questId: undefined,
        questTaskId: undefined,
        playerCharacterIds: [],
        npcIds: [],
        monsterIds: [],
        timelineEventIds: [],
        createdAt: Date.now(),
      },
      {
        name: "Temple Negotiation",
        description: "The party attempts to negotiate with Sister Garaele at the temple for information about the missing villagers.",
        creatorId: user._id,
        campaignId: undefined,
        questId: undefined,
        questTaskId: undefined,
        playerCharacterIds: [],
        npcIds: [],
        monsterIds: [],
        timelineEventIds: [],
        createdAt: Date.now(),
      },
      {
        name: "Guild Hall Intrigue",
        description: "A tense meeting with Halia Thornton at the guild hall reveals hidden agendas and political maneuvering.",
        creatorId: user._id,
        campaignId: undefined,
        questId: undefined,
        questTaskId: undefined,
        playerCharacterIds: [],
        npcIds: [],
        monsterIds: [],
        timelineEventIds: [],
        createdAt: Date.now(),
      },
      {
        name: "Rescue Mission",
        description: "The party attempts to rescue Sildar Hallwinter from the goblin hideout, facing various challenges along the way.",
        creatorId: user._id,
        campaignId: undefined,
        questId: undefined,
        questTaskId: undefined,
        playerCharacterIds: [],
        npcIds: [],
        monsterIds: [],
        timelineEventIds: [],
        createdAt: Date.now(),
      }
    ];

    const results = [] as any[];

    // Create sample interactions
    for (const interaction of sampleInteractions) {
      const interactionId = await ctx.db.insert("interactions", interaction);
      results.push(interactionId);
    }

    return {
      interactions: results,
      count: results.length
    };
  },
}); 