import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createPlayerAction = mutation({
  args: {
    interactionId: v.id("interactions"),
    playerCharacterId: v.id("playerCharacters"),
    actionDescription: v.string(),
    actionType: v.union(
      v.literal("Dialogue"),
      v.literal("CombatAction"), 
      v.literal("PuzzleInput"),
      v.literal("Custom")
    ),
    associatedItemId: v.optional(v.id("items")),
  },
  handler: async (ctx, args) => {
    const actionId = await ctx.db.insert("playerActions", {
      ...args,
      submittedAt: Date.now(),
      status: "PENDING",
      createdAt: Date.now(),
    });
    return actionId;
  },
});

export const updatePlayerAction = mutation({
  args: {
    id: v.id("playerActions"),
    status: v.optional(v.union(
      v.literal("PENDING"),
      v.literal("DM_REVIEW"),
      v.literal("RESOLVED"),
      v.literal("SKIPPED")
    )),
    dmNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
  },
});

export const getPlayerActionsByInteraction = query({
  args: { interactionId: v.id("interactions") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("playerActions")
      .filter((q) => q.eq(q.field("interactionId"), args.interactionId))
      .order("desc")
      .collect();
  },
});

export const getPlayerActionsByCharacter = query({
  args: { playerCharacterId: v.id("playerCharacters") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("playerActions")
      .filter((q) => q.eq(q.field("playerCharacterId"), args.playerCharacterId))
      .order("desc")
      .collect();
  },
});

export const getPendingPlayerActions = query({
  args: { interactionId: v.id("interactions") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("playerActions")
      .filter((q) => 
        q.and(
          q.eq(q.field("interactionId"), args.interactionId),
          q.eq(q.field("status"), "PENDING")
        )
      )
      .order("asc")
      .collect();
  },
});

export const getPlayerActionById = query({
  args: { id: v.id("playerActions") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const deletePlayerAction = mutation({
  args: { id: v.id("playerActions") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
}); 