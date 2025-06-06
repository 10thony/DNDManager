import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createPlayerCharacter = mutation({
  args: {
    name: v.string(),
    race: v.string(),
    class: v.string(),
    background: v.string(),
    alignment: v.optional(v.string()),
    abilityScores: v.object({
      strength: v.number(),
      dexterity: v.number(),
      constitution: v.number(),
      intelligence: v.number(),
      wisdom: v.number(),
      charisma: v.number(),
    }),
    skills: v.array(v.string()),
    savingThrows: v.array(v.string()),
    proficiencies: v.array(v.string()),
    traits: v.optional(v.array(v.string())),
    languages: v.optional(v.array(v.string())),
    equipment: v.optional(v.array(v.string())),
    level: v.number(),
    hitPoints: v.number(),
    armorClass: v.number(),
    proficiencyBonus: v.number(),
  },
  handler: async (ctx, args) => {
    const characterId = await ctx.db.insert("playerCharacters", {
      ...args,
      createdAt: Date.now(),
    });
    return characterId;
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
