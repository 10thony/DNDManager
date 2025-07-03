import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createQuest = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    campaignId: v.optional(v.id("campaigns")),
    clerkId: v.string(),
    status: v.union(
      v.literal("NotStarted"),
      v.literal("InProgress"),
      v.literal("Completed"),
      v.literal("Failed")
    ),
    locationId: v.optional(v.id("locations")),
    taskIds: v.array(v.id("questTasks")),
    requiredItemIds: v.optional(v.array(v.id("items"))),
    involvedNpcIds: v.optional(v.array(v.id("npcs"))),
    participantIds: v.optional(v.array(v.id("playerCharacters"))),
    interactions: v.optional(v.array(v.id("interactions"))),
    rewards: v.optional(
      v.object({
        xp: v.optional(v.number()),
        gold: v.optional(v.number()),
        itemIds: v.optional(v.array(v.id("items"))),
      })
    ),
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

    const { clerkId, ...questData } = args;
    const questId = await ctx.db.insert("quests", {
      ...questData,
      creatorId: user._id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    return questId;
  },
});

export const getAllQuests = query({
  handler: async (ctx) => {
    return await ctx.db.query("quests").order("desc").collect();
  },
});

export const getQuestsByCampaign = query({
  args: { campaignId: v.id("campaigns") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("quests")
      .filter((q) => q.eq(q.field("campaignId"), args.campaignId))
      .order("desc")
      .collect();
  },
});

export const getQuestById = query({
  args: { id: v.id("quests") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const updateQuest = mutation({
  args: {
    id: v.id("quests"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal("NotStarted"),
        v.literal("InProgress"),
        v.literal("Completed"),
        v.literal("Failed")
      )
    ),
    locationId: v.optional(v.id("locations")),
    taskIds: v.optional(v.array(v.id("questTasks"))),
    requiredItemIds: v.optional(v.array(v.id("items"))),
    involvedNpcIds: v.optional(v.array(v.id("npcs"))),
    participantIds: v.optional(v.array(v.id("playerCharacters"))),
    interactions: v.optional(v.array(v.id("interactions"))),
    rewards: v.optional(
      v.object({
        xp: v.optional(v.number()),
        gold: v.optional(v.number()),
        itemIds: v.optional(v.array(v.id("items"))),
      })
    ),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

export const deleteQuest = mutation({
  args: { id: v.id("quests") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const updateQuestStatus = mutation({
  args: {
    id: v.id("quests"),
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

export const generateSampleQuests = mutation({
  args: {
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

    const sampleData = {
      quests: [
        {
          id: "quest1",
          name: "The Missing Scout",
          description: "Find and report back on the whereabouts of a missing scout near the Whispering Woods.",
          status: "NotStarted" as const,
          taskIds: ["task1", "task2", "task3"],
          createdAt: 1719800000
        },
        {
          id: "quest2",
          name: "Trouble in the Woods",
          description: "Investigate strange sightings and eliminate threats in the Whispering Woods.",
          status: "NotStarted" as const,
          taskIds: ["task4", "task5", "task6"],
          createdAt: 1719803600
        },
        {
          id: "quest3",
          name: "The Broken Seal",
          description: "Explore the ruins and uncover the origin of the corruption.",
          status: "NotStarted" as const,
          taskIds: ["task7", "task8", "task9"],
          createdAt: 1719807200
        },
        {
          id: "quest4",
          name: "Secrets of the Deep Crypt",
          description: "Delve into the underground crypt to stop the ancient force awakening.",
          status: "NotStarted" as const,
          taskIds: ["task10", "task11", "task12"],
          createdAt: 1719810800
        },
        {
          id: "quest5",
          name: "Final Stand at Black Hollow",
          description: "Defend the town from the final wave of darkness.",
          status: "NotStarted" as const,
          taskIds: ["task13", "task14", "task15"],
          createdAt: 1719814400
        }
      ],
      questTasks: [
        {
          id: "task1",
          questId: "quest1",
          title: "Speak with the Captain",
          type: "Speak" as const,
          status: "NotStarted" as const,
          createdAt: 1719800000
        },
        {
          id: "task2",
          questId: "quest1",
          title: "Search the Southern Trail",
          type: "Explore" as const,
          status: "NotStarted" as const,
          createdAt: 1719800100
        },
        {
          id: "task3",
          questId: "quest1",
          title: "Report Back",
          type: "Deliver" as const,
          status: "NotStarted" as const,
          createdAt: 1719800200
        },
        {
          id: "task4",
          questId: "quest2",
          title: "Investigate Strange Markings",
          type: "Explore" as const,
          status: "NotStarted" as const,
          createdAt: 1719803600
        },
        {
          id: "task5",
          questId: "quest2",
          title: "Defeat the Shadow Creatures",
          type: "Kill" as const,
          status: "NotStarted" as const,
          createdAt: 1719803700
        },
        {
          id: "task6",
          questId: "quest2",
          title: "Collect Shadow Essence",
          type: "Fetch" as const,
          status: "NotStarted" as const,
          createdAt: 1719803800
        },
        {
          id: "task7",
          questId: "quest3",
          title: "Enter the Forgotten Ruins",
          type: "Explore" as const,
          status: "NotStarted" as const,
          createdAt: 1719807200
        },
        {
          id: "task8",
          questId: "quest3",
          title: "Solve the Sealing Puzzle",
          type: "Puzzle" as const,
          status: "NotStarted" as const,
          createdAt: 1719807300
        },
        {
          id: "task9",
          questId: "quest3",
          title: "Speak to the Spirit Guardian",
          type: "Speak" as const,
          status: "NotStarted" as const,
          createdAt: 1719807400
        },
        {
          id: "task10",
          questId: "quest4",
          title: "Find the Crypt Entrance",
          type: "Explore" as const,
          status: "NotStarted" as const,
          createdAt: 1719810800
        },
        {
          id: "task11",
          questId: "quest4",
          title: "Escort the Ritualist",
          type: "Escort" as const,
          status: "NotStarted" as const,
          createdAt: 1719810900
        },
        {
          id: "task12",
          questId: "quest4",
          title: "Defend the Ritual",
          type: "Kill" as const,
          status: "NotStarted" as const,
          createdAt: 1719811000
        },
        {
          id: "task13",
          questId: "quest5",
          title: "Speak with Mayor Linette",
          type: "Speak" as const,
          status: "NotStarted" as const,
          createdAt: 1719814400
        },
        {
          id: "task14",
          questId: "quest5",
          title: "Prepare the Defenses",
          type: "Custom" as const,
          status: "NotStarted" as const,
          createdAt: 1719814500
        },
        {
          id: "task15",
          questId: "quest5",
          title: "Repel the Final Assault",
          type: "Kill" as const,
          status: "NotStarted" as const,
          createdAt: 1719814600
        }
      ]
    };

    // Create a mapping to store quest IDs and their corresponding task IDs
    const questTaskMapping: Record<string, string[]> = {};
    const createdQuestIds: Record<string, any> = {};
    const createdTaskIds: Record<string, any> = {};

    // First, create all quests
    for (const questData of sampleData.quests) {
      const questId = await ctx.db.insert("quests", {
        name: questData.name,
        description: questData.description,
        creatorId: user._id,
        status: questData.status,
        taskIds: [], // Will be updated after tasks are created
        createdAt: questData.createdAt,
        updatedAt: questData.createdAt,
      });
      createdQuestIds[questData.id] = questId;
      questTaskMapping[questId] = questData.taskIds;
    }

    // Then, create all quest tasks
    for (const taskData of sampleData.questTasks) {
      const questId = createdQuestIds[taskData.questId];
      if (questId) {
        const taskId = await ctx.db.insert("questTasks", {
          questId: questId,
          title: taskData.title,
          type: taskData.type,
          status: taskData.status,
          userId: user._id,
          createdAt: taskData.createdAt,
          updatedAt: taskData.createdAt,
        });
        createdTaskIds[taskData.id] = taskId;
      }
    }

    // Finally, update quests with the correct task IDs
    for (const [questIdKey, taskIds] of Object.entries(questTaskMapping)) {
      const actualTaskIds = taskIds.map(taskId => createdTaskIds[taskId]).filter(Boolean);
      await ctx.db.patch(questIdKey as any, {
        taskIds: actualTaskIds,
        updatedAt: Date.now(),
      });
    }

    return {
      questsCreated: Object.keys(createdQuestIds).length,
      tasksCreated: Object.keys(createdTaskIds).length,
    };
  },
}); 