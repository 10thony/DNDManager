import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createQuestTask = mutation({
  args: {
    questId: v.id("quests"),
    title: v.string(),
    description: v.optional(v.string()),
    type: v.union(
      v.literal("Fetch"),
      v.literal("Kill"),
      v.literal("Speak"),
      v.literal("Explore"),
      v.literal("Puzzle"),
      v.literal("Deliver"),
      v.literal("Escort"),
      v.literal("Custom")
    ),
    status: v.union(
      v.literal("NotStarted"),
      v.literal("InProgress"),
      v.literal("Completed"),
      v.literal("Failed")
    ),
    dependsOn: v.optional(v.array(v.id("questTasks"))),
    assignedTo: v.optional(v.array(v.id("playerCharacters"))),
    locationId: v.optional(v.id("locations")),
    targetNpcId: v.optional(v.id("npcs")),
    requiredItemIds: v.optional(v.array(v.id("items"))),
    interactions: v.optional(v.array(v.id("interactions"))),
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

    const { clerkId, ...taskData } = args;
    const taskId = await ctx.db.insert("questTasks", {
      ...taskData,
      userId: user._id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    return taskId;
  },
});

export const getAllQuestTasks = query({
  handler: async (ctx) => {
    return await ctx.db.query("questTasks").order("desc").collect();
  },
});

export const getQuestTasksByQuest = query({
  args: { questId: v.id("quests") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("questTasks")
      .filter((q) => q.eq(q.field("questId"), args.questId))
      .order("desc")
      .collect();
  },
});

export const getQuestTaskById = query({
  args: { id: v.id("questTasks") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const updateQuestTask = mutation({
  args: {
    id: v.id("questTasks"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    type: v.optional(
      v.union(
        v.literal("Fetch"),
        v.literal("Kill"),
        v.literal("Speak"),
        v.literal("Explore"),
        v.literal("Puzzle"),
        v.literal("Deliver"),
        v.literal("Escort"),
        v.literal("Custom")
      )
    ),
    status: v.optional(
      v.union(
        v.literal("NotStarted"),
        v.literal("InProgress"),
        v.literal("Completed"),
        v.literal("Failed")
      )
    ),
    dependsOn: v.optional(v.array(v.id("questTasks"))),
    assignedTo: v.optional(v.array(v.id("playerCharacters"))),
    locationId: v.optional(v.id("locations")),
    targetNpcId: v.optional(v.id("npcs")),
    requiredItemIds: v.optional(v.array(v.id("items"))),
    interactions: v.optional(v.array(v.id("interactions"))),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

export const deleteQuestTask = mutation({
  args: { id: v.id("questTasks") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const updateQuestTaskStatus = mutation({
  args: {
    id: v.id("questTasks"),
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

export const assignQuestTaskToCharacters = mutation({
  args: {
    id: v.id("questTasks"),
    characterIds: v.array(v.id("playerCharacters")),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      assignedTo: args.characterIds,
      updatedAt: Date.now(),
    });
  },
}); 