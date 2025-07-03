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
    dmId: v.string(), // Clerk user ID of DM
    players: v.optional(v.array(v.string())), // List of Clerk user IDs
    participantPlayerCharacterIds: v.optional(v.array(v.id("playerCharacters"))),
    participantUserIds: v.optional(v.array(v.id("users"))),
    tags: v.optional(v.array(v.id("tags"))),
    npcIds: v.optional(v.array(v.id("npcs"))),
    questIds: v.optional(v.array(v.id("quests"))),
    locationIds: v.optional(v.array(v.id("locations"))),
    monsterIds: v.optional(v.array(v.id("monsters"))),
  },
  handler: async (ctx, args) => {
    const campaignId = await ctx.db.insert("campaigns", {
      name: args.name,
      creatorId: args.creatorId,
      description: args.description,
      worldSetting: args.worldSetting,
      startDate: args.startDate,
      isPublic: args.isPublic,
      dmId: args.dmId,
      players: args.players,
      participantPlayerCharacterIds: args.participantPlayerCharacterIds,
      participantUserIds: args.participantUserIds,
      tags: args.tags,
      npcIds: args.npcIds,
      questIds: args.questIds,
      locationIds: args.locationIds,
      monsterIds: args.monsterIds,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    return campaignId;
  },
});

export const getAllCampaigns = query({
  args: { clerkId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (!args.clerkId) {
      // No clerkId provided, only show public campaigns
      return await ctx.db
        .query("campaigns")
        .filter((q) => q.eq(q.field("isPublic"), true))
        .order("desc")
        .collect();
    }

    // Get user role
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), args.clerkId))
      .first();

    // Admins can see all campaigns
    if (user?.role === "admin") {
      return await ctx.db
        .query("campaigns")
        .order("desc")
        .collect();
    }

    // Regular users can see public campaigns, their own campaigns, or campaigns they're players in
    const campaigns = await ctx.db
      .query("campaigns")
      .filter((q) =>
        q.or(
          q.eq(q.field("isPublic"), true),
          q.eq(q.field("dmId"), args.clerkId)
        )
      )
      .order("desc")
      .collect();

    // Filter campaigns where user is a player (client-side filtering for array contains)
    const campaignsWithPlayerAccess = campaigns.filter(campaign => 
      campaign.players?.includes(args.clerkId!)
    );

    return campaignsWithPlayerAccess;
  },
});

export const getCampaignsWithPagination = query({
  args: {
    page: v.number(),
    pageSize: v.number(),
    clerkId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { page, pageSize, clerkId } = args;
    const offset = page * pageSize;
    
    let campaignsQuery = ctx.db.query("campaigns");
    
    // Apply role-based filtering
    if (clerkId) {
      const user = await ctx.db
        .query("users")
        .filter((q) => q.eq(q.field("clerkId"), clerkId))
        .first();

      if (user?.role !== "admin") {
        campaignsQuery = campaignsQuery        .filter((q) =>
          q.or(
            q.eq(q.field("isPublic"), true),
            q.eq(q.field("dmId"), clerkId)
          )
        );
      }
    } else {
      // No clerkId provided, only show public campaigns
      campaignsQuery = campaignsQuery.filter((q) => q.eq(q.field("isPublic"), true));
    }
    
    const campaigns = await campaignsQuery
      .order("desc")
      .paginate({ numItems: pageSize, cursor: offset.toString() });
    
    return campaigns;
  },
});

export const getCampaignById = query({
  args: { 
    id: v.id("campaigns"),
    clerkId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const campaign = await ctx.db.get(args.id);
    if (!campaign) return null;

    // If no clerkId provided, only return if campaign is public
    if (!args.clerkId) {
      return campaign.isPublic ? campaign : null;
    }

    // Get user role
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), args.clerkId))
      .first();

    // Admins can access all campaigns
    if (user?.role === "admin") {
      return campaign;
    }

    // Regular users can access public campaigns, their own campaigns, or campaigns they're players in
    if (
      campaign.isPublic ||
      campaign.dmId === args.clerkId ||
      campaign.players?.includes(args.clerkId)
    ) {
      return campaign;
    }

    return null; // Access denied
  },
});

export const updateCampaign = mutation({
  args: {
    id: v.id("campaigns"),
    clerkId: v.string(), // Required for authorization
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    worldSetting: v.optional(v.string()),
    startDate: v.optional(v.number()),
    isPublic: v.optional(v.boolean()),
    players: v.optional(v.array(v.string())),
    participantPlayerCharacterIds: v.optional(v.array(v.id("playerCharacters"))),
    participantUserIds: v.optional(v.array(v.id("users"))),
    tags: v.optional(v.array(v.id("tags"))),
    npcIds: v.optional(v.array(v.id("npcs"))),
    questIds: v.optional(v.array(v.id("quests"))),
    locationIds: v.optional(v.array(v.id("locations"))),
    monsterIds: v.optional(v.array(v.id("monsters"))),
    timelineEventIds: v.optional(v.array(v.id("timelineEvents"))),
  },
  handler: async (ctx, args) => {
    const { id, clerkId, ...updates } = args;
    
    // Get campaign and user for authorization
    const campaign = await ctx.db.get(id);
    if (!campaign) throw new Error("Campaign not found");

    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), clerkId))
      .first();

    // Check authorization: only admins, DM, or creator can update
    if (
      user?.role !== "admin" &&
      campaign.dmId !== clerkId &&
      campaign.creatorId !== user?._id
    ) {
      throw new Error("Unauthorized: Only admins, DM, or creator can update campaigns");
    }

    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

export const deleteCampaign = mutation({
  args: { 
    id: v.id("campaigns"),
    clerkId: v.string(), // Required for authorization
  },
  handler: async (ctx, args) => {
    const campaign = await ctx.db.get(args.id);
    if (!campaign) throw new Error("Campaign not found");

    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), args.clerkId))
      .first();

    // Only admins can delete campaigns
    if (user?.role !== "admin") {
      throw new Error("Unauthorized: Only admins can delete campaigns");
    }

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