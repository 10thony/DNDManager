import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

export const locationTypes = [
  "Town",
  "City",
  "Village",
  "Dungeon",
  "Castle",
  "Forest",
  "Mountain",
  "Temple",
  "Ruins",
  "Camp",
  "Other"
] as const;

export type LocationType = typeof locationTypes[number];

// Create a new campaign
export const createCampaign = mutation({
  args: {
    name: v.string(),
    creatorId: v.string(),
  },
  handler: async (ctx, args) => {
    const campaignId = await ctx.db.insert("campaigns", {
      name: args.name,
      creatorId: args.creatorId,
      createdAt: Date.now(),
    });
    return campaignId;
  },
});

// Get all campaigns
export const getCampaigns = query({
  handler: async (ctx) => {
    return await ctx.db.query("campaigns").collect();
  },
});

// Create a new NPC
export const createNPC = mutation({
  args: {
    name: v.string(),
    creatorId: v.string(),
  },
  handler: async (ctx, args) => {
    const npcId = await ctx.db.insert("npcs", {
      name: args.name,
      creatorId: args.creatorId,
      createdAt: Date.now(),
    });
    return npcId;
  },
});

// Get all NPCs
export const getNPCs = query({
  handler: async (ctx) => {
    return await ctx.db.query("npcs").collect();
  },
});

export const create = mutation({
  args: {
    campaignId: v.id("campaigns"),
    name: v.string(),
    type: v.string(),
    description: v.string(),
    notableNpcIds: v.array(v.id("npcs")),
    linkedLocations: v.array(v.id("locations")),
    interactionsAtLocation: v.array(v.id("interactions")),
    imageUrls: v.array(v.string()),
    secrets: v.string(),
    mapId: v.optional(v.id("maps")),
    creatorId: v.string(),
  },
  handler: async (ctx, args) => {
    const locationId = await ctx.db.insert("locations", {
      campaignId: args.campaignId,
      name: args.name,
      type: args.type as LocationType,
      description: args.description,
      notableNpcIds: args.notableNpcIds,
      linkedLocations: args.linkedLocations,
      interactionsAtLocation: args.interactionsAtLocation,
      imageUrls: args.imageUrls,
      secrets: args.secrets,
      mapId: args.mapId,
      creatorId: args.creatorId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    return locationId;
  },
});

export const list = query({
  handler: async (ctx) => {
    const locations = await ctx.db.query("locations").collect();
    return locations;
  },
});

export const getById = query({
  args: { id: v.id("locations") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const get = query({
  args: { id: v.id("locations") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
}); 