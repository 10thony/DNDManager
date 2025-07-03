import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createFaction = mutation({
  args: {
    campaignId: v.id("campaigns"),
    name: v.string(),
    description: v.string(),
    leaderNpcIds: v.optional(v.array(v.id("npcs"))),
    alliedFactionIds: v.optional(v.array(v.id("factions"))),
    enemyFactionIds: v.optional(v.array(v.id("factions"))),
    goals: v.optional(v.array(v.string())),
    reputation: v.optional(
      v.array(
        v.object({
          playerCharacterId: v.id("playerCharacters"),
          score: v.number(),
        })
      )
    ),
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

    const { clerkId, ...factionData } = args;
    const factionId = await ctx.db.insert("factions", {
      ...factionData,
      userId: user._id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return factionId;
  },
});

export const getFactions = query({
  args: {
    campaignId: v.optional(v.id("campaigns")),
  },
  handler: async (ctx, args) => {
    const factions = await ctx.db.query("factions").collect();
    
    // Filter by campaign if provided
    const filteredFactions = args.campaignId 
      ? factions.filter(faction => faction.campaignId === args.campaignId)
      : factions;
    
    // Populate related data
    const populatedFactions = await Promise.all(
      filteredFactions.map(async (faction) => {
        const leaders = faction.leaderNpcIds 
          ? await Promise.all(
              faction.leaderNpcIds.map(id => ctx.db.get(id))
            )
          : [];
        
        const allies = faction.alliedFactionIds
          ? await Promise.all(
              faction.alliedFactionIds.map(id => ctx.db.get(id))
            )
          : [];
        
        const enemies = faction.enemyFactionIds
          ? await Promise.all(
              faction.enemyFactionIds.map(id => ctx.db.get(id))
            )
          : [];

        return {
          ...faction,
          leaders: leaders.filter(Boolean),
          allies: allies.filter(Boolean),
          enemies: enemies.filter(Boolean),
        };
      })
    );

    return populatedFactions;
  },
});

export const getFactionById = query({
  args: {
    factionId: v.id("factions"),
  },
  handler: async (ctx, args) => {
    const faction = await ctx.db.get(args.factionId);
    if (!faction) {
      throw new Error("Faction not found");
    }

    // Populate related data
    const leaders = faction.leaderNpcIds 
      ? await Promise.all(
          faction.leaderNpcIds.map(id => ctx.db.get(id))
        )
      : [];
    
    const allies = faction.alliedFactionIds
      ? await Promise.all(
          faction.alliedFactionIds.map(id => ctx.db.get(id))
        )
      : [];
    
    const enemies = faction.enemyFactionIds
      ? await Promise.all(
          faction.enemyFactionIds.map(id => ctx.db.get(id))
        )
      : [];

    return {
      ...faction,
      leaders: leaders.filter(Boolean),
      allies: allies.filter(Boolean),
      enemies: enemies.filter(Boolean),
    };
  },
});

export const updateFaction = mutation({
  args: {
    factionId: v.id("factions"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    leaderNpcIds: v.optional(v.array(v.id("npcs"))),
    alliedFactionIds: v.optional(v.array(v.id("factions"))),
    enemyFactionIds: v.optional(v.array(v.id("factions"))),
    goals: v.optional(v.array(v.string())),
    reputation: v.optional(
      v.array(
        v.object({
          playerCharacterId: v.id("playerCharacters"),
          score: v.number(),
        })
      )
    ),
  },
  handler: async (ctx, args) => {
    const { factionId, ...updateData } = args;
    
    await ctx.db.patch(factionId, {
      ...updateData,
      updatedAt: Date.now(),
    });

    return factionId;
  },
});

export const deleteFaction = mutation({
  args: {
    factionId: v.id("factions"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.factionId);
  },
});

export const getFactionsByIds = query({
  args: {
    ids: v.array(v.id("factions")),
  },
  handler: async (ctx, args) => {
    const factions = await Promise.all(
      args.ids.map(id => ctx.db.get(id))
    );

    return factions.filter(Boolean);
  },
}); 