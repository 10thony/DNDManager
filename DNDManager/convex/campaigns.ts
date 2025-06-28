import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createCampaign = mutation({
  args: {
    name: v.string(),
    creatorId: v.id("users"),
    description: v.optional(v.string()),
    worldSetting: v.optional(v.string()),
    startDate: v.optional(v.number()),
    isPublic: v.boolean(),
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

export const getCampaignsWithPagination = query({
  args: {
    page: v.number(),
    pageSize: v.number(),
  },
  handler: async (ctx, args) => {
    const { page, pageSize } = args;
    const offset = page * pageSize;
    
    const campaigns = await ctx.db
      .query("campaigns")
      .order("desc")
      .paginate({ numItems: pageSize, cursor: offset.toString() });
    
    return campaigns;
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
    isPublic: v.optional(v.boolean()),
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

// TODO: implement - Add timeline event to campaign
export const addTimelineEventToCampaign = mutation({
  args: {
    campaignId: v.id("campaigns"),
    timelineEventId: v.id("timelineEvents"),
  },
  handler: async (ctx, args) => {
    const campaign = await ctx.db.get(args.campaignId);
    if (!campaign) throw new Error("Campaign not found");
    
    const currentTimelineEvents = campaign.timelineEventIds || [];
    await ctx.db.patch(args.campaignId, {
      timelineEventIds: [...currentTimelineEvents, args.timelineEventId],
      updatedAt: Date.now(),
    });
  },
});

// TODO: implement - Add player character to campaign
export const addPlayerCharacterToCampaign = mutation({
  args: {
    campaignId: v.id("campaigns"),
    playerCharacterId: v.id("playerCharacters"),
  },
  handler: async (ctx, args) => {
    const campaign = await ctx.db.get(args.campaignId);
    if (!campaign) throw new Error("Campaign not found");
    
    const currentPlayerCharacters = campaign.participantPlayerCharacterIds || [];
    await ctx.db.patch(args.campaignId, {
      participantPlayerCharacterIds: [...currentPlayerCharacters, args.playerCharacterId],
      updatedAt: Date.now(),
    });
  },
});

// TODO: implement - Add NPC to campaign
export const addNPCToCampaign = mutation({
  args: {
    campaignId: v.id("campaigns"),
    npcId: v.id("npcs"),
  },
  handler: async (ctx, args) => {
    const campaign = await ctx.db.get(args.campaignId);
    if (!campaign) throw new Error("Campaign not found");
    
    const currentNPCs = campaign.npcIds || [];
    await ctx.db.patch(args.campaignId, {
      npcIds: [...currentNPCs, args.npcId],
      updatedAt: Date.now(),
    });
  },
});

// TODO: implement - Add quest to campaign
export const addQuestToCampaign = mutation({
  args: {
    campaignId: v.id("campaigns"),
    questId: v.id("quests"),
  },
  handler: async (ctx, args) => {
    const campaign = await ctx.db.get(args.campaignId);
    if (!campaign) throw new Error("Campaign not found");
    
    const currentQuests = campaign.questIds || [];
    await ctx.db.patch(args.campaignId, {
      questIds: [...currentQuests, args.questId],
      updatedAt: Date.now(),
    });
  },
});

// TODO: implement - Add interaction to campaign
export const addInteractionToCampaign = mutation({
  args: {
    campaignId: v.id("campaigns"),
    interactionId: v.id("interactions"),
  },
  handler: async (ctx, args) => {
    const campaign = await ctx.db.get(args.campaignId);
    if (!campaign) throw new Error("Campaign not found");
    
    // Note: interactions are not directly stored in campaigns table
    // They are linked through the interactions table's campaignId field
    // This mutation would need to be implemented differently
    throw new Error("Not implemented - interactions are linked via campaignId in interactions table");
  },
});

// TODO: implement - Add location to campaign
export const addLocationToCampaign = mutation({
  args: {
    campaignId: v.id("campaigns"),
    locationId: v.id("locations"),
  },
  handler: async (ctx, args) => {
    const campaign = await ctx.db.get(args.campaignId);
    if (!campaign) throw new Error("Campaign not found");
    
    const currentLocations = campaign.locationIds || [];
    await ctx.db.patch(args.campaignId, {
      locationIds: [...currentLocations, args.locationId],
      updatedAt: Date.now(),
    });
  },
});

// TODO: implement - Add monster to campaign
export const addMonsterToCampaign = mutation({
  args: {
    campaignId: v.id("campaigns"),
    monsterId: v.id("monsters"),
  },
  handler: async (ctx, args) => {
    const campaign = await ctx.db.get(args.campaignId);
    if (!campaign) throw new Error("Campaign not found");
    
    const currentMonsters = campaign.monsterIds || [];
    await ctx.db.patch(args.campaignId, {
      monsterIds: [...currentMonsters, args.monsterId],
      updatedAt: Date.now(),
    });
  },
}); 