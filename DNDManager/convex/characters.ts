import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createPlayerCharacter = mutation({
  args: {
    name: v.string(),
    race: v.string(),
    class: v.string(),
    background: v.string(),
    alignment: v.optional(v.string()),
    characterType: v.union(v.literal("PlayerCharacter"), v.literal("NonPlayerCharacter")),
    abilityScores: v.object({
      strength: v.float64(),
      dexterity: v.float64(),
      constitution: v.float64(),
      intelligence: v.float64(),
      wisdom: v.float64(),
      charisma: v.float64(),
    }),
    skills: v.array(v.string()),
    savingThrows: v.array(v.string()),
    proficiencies: v.array(v.string()),
    traits: v.optional(v.array(v.string())),
    languages: v.optional(v.array(v.string())),
    equipment: v.optional(v.array(v.string())),
    level: v.float64(),
    experiencePoints: v.number(),
    xpHistory: v.optional(
      v.array(
        v.object({
          amount: v.number(),
          source: v.string(),
          date: v.number(),
        })
      )
    ),
    hitPoints: v.float64(),
    armorClass: v.float64(),
    proficiencyBonus: v.float64(),
    actions: v.array(v.id("actions")),
    factionId: v.optional(v.id("factions")),
  },
  handler: async (ctx, args) => {
    const { characterType, ...characterData } = args;
    
    if (characterType === "NonPlayerCharacter") {
      // Create NPC in the npcs table
      const npcId = await ctx.db.insert("npcs", {
        ...characterData,
        characterType,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      return npcId;
    } else {
      // Create player character in the playerCharacters table
      const characterId = await ctx.db.insert("playerCharacters", {
        ...characterData,
        characterType,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      return characterId;
    }
  },
});

export const getAllCharacters = query({
  handler: async (ctx) => {
    return await ctx.db.query("playerCharacters").order("desc").collect();
  },
});

export const getCharacterById = query({
  args: { id: v.id("playerCharacters") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const deleteCharacter = mutation({
  args: { id: v.id("playerCharacters") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const updateCharacter = mutation({
  args: {
    id: v.id("playerCharacters"),
    name: v.optional(v.string()),
    race: v.optional(v.string()),
    class: v.optional(v.string()),
    background: v.optional(v.string()),
    alignment: v.optional(v.string()),
    characterType: v.optional(v.union(v.literal("PlayerCharacter"), v.literal("NonPlayerCharacter"))),
    abilityScores: v.optional(v.object({
      strength: v.float64(),
      dexterity: v.float64(),
      constitution: v.float64(),
      intelligence: v.float64(),
      wisdom: v.float64(),
      charisma: v.float64(),
    })),
    skills: v.optional(v.array(v.string())),
    savingThrows: v.optional(v.array(v.string())),
    proficiencies: v.optional(v.array(v.string())),
    traits: v.optional(v.array(v.string())),
    languages: v.optional(v.array(v.string())),
    equipment: v.optional(v.array(v.string())),
    level: v.optional(v.float64()),
    experiencePoints: v.optional(v.number()),
    xpHistory: v.optional(
      v.array(
        v.object({
          amount: v.number(),
          source: v.string(),
          date: v.number(),
        })
      )
    ),
    hitPoints: v.optional(v.float64()),
    armorClass: v.optional(v.float64()),
    proficiencyBonus: v.optional(v.float64()),
    actions: v.optional(v.array(v.id("actions"))),
    factionId: v.optional(v.id("factions")),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

export const addExperiencePoints = mutation({
  args: {
    id: v.id("playerCharacters"),
    amount: v.number(),
    source: v.string(),
  },
  handler: async (ctx, args) => {
    const character = await ctx.db.get(args.id);
    if (!character) {
      throw new Error("Character not found");
    }

    const currentXP = character.experiencePoints || 0;
    const newXP = currentXP + args.amount;
    
    const currentHistory = character.xpHistory || [];
    const newHistoryEntry = {
      amount: args.amount,
      source: args.source,
      date: Date.now(),
    };

    await ctx.db.patch(args.id, {
      experiencePoints: newXP,
      xpHistory: [...currentHistory, newHistoryEntry],
      updatedAt: Date.now(),
    });
  },
});
