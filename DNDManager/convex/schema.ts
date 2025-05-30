import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  playerCharacters: defineTable({
    name: v.string(),
    class: v.string(),
    race: v.string(),
    background: v.string(),
    level: v.number(),
    hitPoints: v.number(),
    armorClass: v.number(),
    proficiencyBonus: v.number(),
    speed: v.number(),
    abilityScores: v.object({
      strength: v.number(),
      dexterity: v.number(),
      constitution: v.number(),
      intelligence: v.number(),
      wisdom: v.number(),
      charisma: v.number(),
    }),
    savingThrows: v.object({
      strength: v.number(),
      dexterity: v.number(),
      constitution: v.number(),
      intelligence: v.number(),
      wisdom: v.number(),
      charisma: v.number(),
    }),
    skills: v.array(v.string()),
    languages: v.array(v.string()),
    proficiencies: v.array(v.string()),
    equipment: v.array(v.string()),
    spells: v.optional(v.array(v.string())),
    notes: v.optional(v.string()),
    createdAt: v.number(),
  }),
});
