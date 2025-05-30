import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  characters: defineTable({
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
    createdAt: v.number(),
    updatedAt: v.number(),
  }),
});
