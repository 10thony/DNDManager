import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createCharacter = mutation({
  args: {
    name: v.string(),
    class: v.string(),
    race: v.string(),
    background: v.string(),
    level: v.number(),
    hitPoints: v.object({
      current: v.number(),
      maximum: v.number(),
      temporary: v.number(),
    }),
    armorClass: v.number(),
    speed: v.number(),
    proficiencyBonus: v.number(),
    abilityScores: v.object({
      strength: v.number(),
      dexterity: v.number(),
      constitution: v.number(),
      intelligence: v.number(),
      wisdom: v.number(),
      charisma: v.number(),
    }),
    savingThrows: v.object({
      strength: v.boolean(),
      dexterity: v.boolean(),
      constitution: v.boolean(),
      intelligence: v.boolean(),
      wisdom: v.boolean(),
      charisma: v.boolean(),
    }),
    skills: v.array(v.string()),
    languages: v.array(v.string()),
    equipment: v.array(v.string()),
    spells: v.optional(
      v.array(
        v.object({
          name: v.string(),
          level: v.number(),
          school: v.string(),
          description: v.string(),
        })
      )
    ),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("characters", {
      ...args,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const getAllCharacters = query({
  handler: async (ctx) => {
    return await ctx.db.query("characters").order("desc").collect();
  },
});

export const getCharacterById = query({
  args: { id: v.id("characters") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const updateCharacter = mutation({
  args: {
    id: v.id("characters"),
    name: v.optional(v.string()),
    class: v.optional(v.string()),
    race: v.optional(v.string()),
    background: v.optional(v.string()),
    level: v.optional(v.number()),
    hitPoints: v.optional(
      v.object({
        current: v.number(),
        maximum: v.number(),
        temporary: v.number(),
      })
    ),
    armorClass: v.optional(v.number()),
    speed: v.optional(v.number()),
    proficiencyBonus: v.optional(v.number()),
    abilityScores: v.optional(
      v.object({
        strength: v.number(),
        dexterity: v.number(),
        constitution: v.number(),
        intelligence: v.number(),
        wisdom: v.number(),
        charisma: v.number(),
      })
    ),
    savingThrows: v.optional(
      v.object({
        strength: v.boolean(),
        dexterity: v.boolean(),
        constitution: v.boolean(),
        intelligence: v.boolean(),
        wisdom: v.boolean(),
        charisma: v.boolean(),
      })
    ),
    skills: v.optional(v.array(v.string())),
    languages: v.optional(v.array(v.string())),
    equipment: v.optional(v.array(v.string())),
    spells: v.optional(
      v.array(
        v.object({
          name: v.string(),
          level: v.number(),
          school: v.string(),
          description: v.string(),
        })
      )
    ),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    return await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

export const deleteCharacter = mutation({
  args: { id: v.id("characters") },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.id);
  },
});
