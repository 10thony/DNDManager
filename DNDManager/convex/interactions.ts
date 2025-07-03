import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createInteraction = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    clerkId: v.string(),
    campaignId: v.optional(v.id("campaigns")),
    relatedQuestId: v.optional(v.id("quests")),
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
      dmUserId: user._id, // Set creator as DM
      status: "PENDING_INITIATIVE",
      createdAt: Date.now(),
      updatedAt: Date.now(),
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
      .filter((q) => q.eq(q.field("relatedQuestId"), args.questId))
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
    relatedQuestId: v.optional(v.id("quests")),
    questTaskId: v.optional(v.id("questTasks")),
    playerCharacterIds: v.optional(v.array(v.id("playerCharacters"))),
    npcIds: v.optional(v.array(v.id("npcs"))),
    monsterIds: v.optional(v.array(v.id("monsters"))),
    timelineEventIds: v.optional(v.array(v.id("timelineEvents"))),
    status: v.optional(v.union(
      v.literal("PENDING_INITIATIVE"),
      v.literal("INITIATIVE_ROLLED"), 
      v.literal("WAITING_FOR_PLAYER_TURN"),
      v.literal("PROCESSING_PLAYER_ACTION"),
      v.literal("DM_REVIEW"),
      v.literal("COMPLETED"),
      v.literal("CANCELLED")
    )),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, { ...updates, updatedAt: Date.now() });
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
        dmUserId: user._id,
        status: "PENDING_INITIATIVE" as const,
        campaignId: undefined,
        relatedQuestId: undefined,
        questTaskId: undefined,
        playerCharacterIds: [],
        npcIds: [],
        monsterIds: [],
        timelineEventIds: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        name: "Goblin Ambush",
        description: "While traveling through the forest, the party is ambushed by a group of goblins. A fierce battle ensues.",
        creatorId: user._id,
        dmUserId: user._id,
        status: "PENDING_INITIATIVE" as const,
        campaignId: undefined,
        relatedQuestId: undefined,
        questTaskId: undefined,
        playerCharacterIds: [],
        npcIds: [],
        monsterIds: [],
        timelineEventIds: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        name: "Temple Negotiation",
        description: "The party attempts to negotiate with Sister Garaele at the temple for information about the missing villagers.",
        creatorId: user._id,
        dmUserId: user._id,
        status: "PENDING_INITIATIVE" as const,
        campaignId: undefined,
        relatedQuestId: undefined,
        questTaskId: undefined,
        playerCharacterIds: [],
        npcIds: [],
        monsterIds: [],
        timelineEventIds: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        name: "Guild Hall Intrigue",
        description: "A tense meeting with Halia Thornton at the guild hall reveals hidden agendas and political maneuvering.",
        creatorId: user._id,
        dmUserId: user._id,
        status: "PENDING_INITIATIVE" as const,
        campaignId: undefined,
        relatedQuestId: undefined,
        questTaskId: undefined,
        playerCharacterIds: [],
        npcIds: [],
        monsterIds: [],
        timelineEventIds: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        name: "Rescue Mission",
        description: "The party attempts to rescue Sildar Hallwinter from the goblin hideout, facing various challenges along the way.",
        creatorId: user._id,
        dmUserId: user._id,
        status: "PENDING_INITIATIVE" as const,
        campaignId: undefined,
        relatedQuestId: undefined,
        questTaskId: undefined,
        playerCharacterIds: [],
        npcIds: [],
        monsterIds: [],
        timelineEventIds: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
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

// ===== LIVE INTERACTION FUNCTIONS =====

export const startInteraction = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    clerkId: v.string(),
    campaignId: v.id("campaigns"),
    dmUserId: v.id("users"),
    relatedLocationId: v.optional(v.id("locations")),
    relatedQuestId: v.optional(v.id("quests")),
    participantPlayerCharacterIds: v.optional(v.array(v.id("playerCharacters"))),
    participantNpcIds: v.optional(v.array(v.id("npcs"))),
    participantMonsterIds: v.optional(v.array(v.id("monsters"))),
    rewardItemIds: v.optional(v.array(v.id("items"))),
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
      status: "PENDING_INITIATIVE",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Set this as the active interaction for the campaign
    await ctx.db.patch(args.campaignId, {
      activeInteractionId: interactionId,
      updatedAt: Date.now(),
    });

    return interactionId;
  },
});

export const rollInitiative = mutation({
  args: {
    interactionId: v.id("interactions"),
    initiativeRolls: v.array(v.object({
      entityId: v.string(),
      entityType: v.union(v.literal("playerCharacter"), v.literal("npc"), v.literal("monster")),
      initiativeRoll: v.number()
    })),
  },
  handler: async (ctx, args) => {
    // Sort initiative order by roll (highest first)
    const sortedInitiative = [...args.initiativeRolls].sort((a, b) => b.initiativeRoll - a.initiativeRoll);
    
    await ctx.db.patch(args.interactionId, {
      initiativeOrder: sortedInitiative,
      currentInitiativeIndex: 0,
      status: "INITIATIVE_ROLLED",
      updatedAt: Date.now(),
    });

    return sortedInitiative;
  },
});

export const submitPlayerAction = mutation({
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
    // Create the player action
    const actionId = await ctx.db.insert("playerActions", {
      ...args,
      submittedAt: Date.now(),
      status: "PENDING",
      createdAt: Date.now(),
    });

    // Update interaction status
    await ctx.db.patch(args.interactionId, {
      status: "PROCESSING_PLAYER_ACTION",
      updatedAt: Date.now(),
    });

    return actionId;
  },
});

export const resolvePlayerAction = mutation({
  args: {
    actionId: v.id("playerActions"),
    status: v.union(
      v.literal("RESOLVED"),
      v.literal("SKIPPED")
    ),
    dmNotes: v.optional(v.string()),
    interactionId: v.id("interactions"),
  },
  handler: async (ctx, args) => {
    const { interactionId, ...actionUpdates } = args;
    
    // Update the player action
    await ctx.db.patch(args.actionId, actionUpdates);

    // Update interaction status
    await ctx.db.patch(interactionId, {
      status: "DM_REVIEW",
      updatedAt: Date.now(),
    });

    return true;
  },
});

export const advanceTurn = mutation({
  args: {
    interactionId: v.id("interactions"),
  },
  handler: async (ctx, args) => {
    const interaction = await ctx.db.get(args.interactionId);
    if (!interaction || !interaction.initiativeOrder || interaction.currentInitiativeIndex === undefined) {
      throw new Error("Invalid interaction state");
    }

    const nextIndex = interaction.currentInitiativeIndex + 1;
    const isLastTurn = nextIndex >= interaction.initiativeOrder.length;

    if (isLastTurn) {
      // End of round, start new round
      await ctx.db.patch(args.interactionId, {
        currentInitiativeIndex: 0,
        status: "WAITING_FOR_PLAYER_TURN",
        updatedAt: Date.now(),
      });
    } else {
      // Move to next participant
      await ctx.db.patch(args.interactionId, {
        currentInitiativeIndex: nextIndex,
        status: "WAITING_FOR_PLAYER_TURN",
        updatedAt: Date.now(),
      });
    }

    return { nextIndex: isLastTurn ? 0 : nextIndex, isNewRound: isLastTurn };
  },
});

export const completeInteraction = mutation({
  args: {
    interactionId: v.id("interactions"),
    xpAwards: v.optional(v.array(v.object({
      playerCharacterId: v.id("playerCharacters"),
      xp: v.number()
    }))),
  },
  handler: async (ctx, args) => {
    const interaction = await ctx.db.get(args.interactionId);
    if (!interaction) {
      throw new Error("Interaction not found");
    }

    // Update interaction status
    await ctx.db.patch(args.interactionId, {
      status: "COMPLETED",
      xpAwards: args.xpAwards,
      updatedAt: Date.now(),
    });

    // Clear active interaction from campaign
    if (interaction.campaignId) {
      await ctx.db.patch(interaction.campaignId, {
        activeInteractionId: undefined,
        updatedAt: Date.now(),
      });
    }

    // Award XP to player characters
    if (args.xpAwards) {
      for (const award of args.xpAwards) {
        const character = await ctx.db.get(award.playerCharacterId);
        if (character) {
          const newXP = character.experiencePoints + award.xp;
          await ctx.db.patch(award.playerCharacterId, {
            experiencePoints: newXP,
            updatedAt: Date.now(),
          });
        }
      }
    }

    return true;
  },
});

export const cancelInteraction = mutation({
  args: {
    interactionId: v.id("interactions"),
  },
  handler: async (ctx, args) => {
    const interaction = await ctx.db.get(args.interactionId);
    if (!interaction) {
      throw new Error("Interaction not found");
    }

    // Update interaction status
    await ctx.db.patch(args.interactionId, {
      status: "CANCELLED",
      updatedAt: Date.now(),
    });

    // Clear active interaction from campaign
    if (interaction.campaignId) {
      await ctx.db.patch(interaction.campaignId, {
        activeInteractionId: undefined,
        updatedAt: Date.now(),
      });
    }

    return true;
  },
});

// ===== LIVE INTERACTION QUERIES =====

export const getActiveInteractionByCampaign = query({
  args: { campaignId: v.id("campaigns") },
  handler: async (ctx, args) => {
    const campaign = await ctx.db.get(args.campaignId);
    if (!campaign || !campaign.activeInteractionId) {
      return null;
    }

    return await ctx.db.get(campaign.activeInteractionId);
  },
});

export const getInteractionWithParticipants = query({
  args: { interactionId: v.id("interactions") },
  handler: async (ctx, args) => {
    const interaction = await ctx.db.get(args.interactionId);
    if (!interaction) {
      return null;
    }

    // Get participant details
    const playerCharacters = interaction.participantPlayerCharacterIds 
      ? await Promise.all(interaction.participantPlayerCharacterIds.map(id => ctx.db.get(id)))
      : [];
    
    const npcs = interaction.participantNpcIds 
      ? await Promise.all(interaction.participantNpcIds.map(id => ctx.db.get(id)))
      : [];
    
    const monsters = interaction.participantMonsterIds 
      ? await Promise.all(interaction.participantMonsterIds.map(id => ctx.db.get(id)))
      : [];

    return {
      interaction,
      participants: {
        playerCharacters: playerCharacters.filter(Boolean),
        npcs: npcs.filter(Boolean),
        monsters: monsters.filter(Boolean),
      }
    };
  },
});

export const getInitiativeOrder = query({
  args: { interactionId: v.id("interactions") },
  handler: async (ctx, args) => {
    const interaction = await ctx.db.get(args.interactionId);
    if (!interaction) {
      return null;
    }

    return {
      initiativeOrder: interaction.initiativeOrder || [],
      currentIndex: interaction.currentInitiativeIndex || 0,
      currentParticipant: interaction.initiativeOrder?.[interaction.currentInitiativeIndex || 0] || null,
    };
  },
});

export const getAllActiveInteractions = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("interactions")
      .filter((q) => 
        q.neq(q.field("status"), "COMPLETED") && 
        q.neq(q.field("status"), "CANCELLED")
      )
      .order("desc")
      .collect();
  },
}); 