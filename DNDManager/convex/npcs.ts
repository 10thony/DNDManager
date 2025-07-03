import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createNpc = mutation({
  args: {
    name: v.string(),
    race: v.string(),
    class: v.string(),
    background: v.string(),
    alignment: v.optional(v.string()),
    characterType: v.union(
      v.literal("PlayerCharacter"),
      v.literal("NonPlayerCharacter")
    ),
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
    experiencePoints: v.float64(),
    xpHistory: v.optional(
      v.array(
        v.object({
          amount: v.float64(),
          source: v.string(),
          date: v.float64(),
        })
      )
    ),
    hitPoints: v.float64(),
    armorClass: v.float64(),
    proficiencyBonus: v.float64(),
    actions: v.array(v.id("actions")),
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

    const { clerkId, ...npcData } = args;
    const npcId = await ctx.db.insert("npcs", {
      ...npcData,
      userId: user._id,
      createdAt: Date.now(),
    });
    return npcId;
  },
});

export const getAllNpcs = query({
  handler: async (ctx) => {
    return await ctx.db.query("npcs").order("desc").collect();
  },
});

export const getNpcById = query({
  args: { id: v.id("npcs") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const updateNpc = mutation({
  args: {
    id: v.id("npcs"),
    name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
  },
});

export const deleteNpc = mutation({
  args: { id: v.id("npcs") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const importNpcData = mutation({
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

    // Import data from the JSON file
    const importData = {
      "npcs": [
        {
          "name": "Old Man Harbin",
          "race": "Human",
          "class": "Commoner",
          "background": "Villager",
          "alignment": "Neutral",
          "characterType": "NonPlayerCharacter" as const,
          "abilityScores": {
            "strength": 10,
            "dexterity": 9,
            "constitution": 10,
            "intelligence": 11,
            "wisdom": 12,
            "charisma": 8
          },
          "skills": ["Insight", "History"],
          "savingThrows": [],
          "proficiencies": [],
          "traits": ["Local Knowledge"],
          "languages": ["Common"],
          "equipment": ["Walking Stick"],
          "level": 1,
          "experiencePoints": 0,
          "xpHistory": [],
          "hitPoints": 6,
          "armorClass": 10,
          "proficiencyBonus": 2,
          "actions": [],
          "createdAt": 1722200000,
          "updatedAt": 1722200000
        },
        {
          "name": "Sister Garaele",
          "race": "Elf",
          "class": "Cleric",
          "background": "Acolyte",
          "alignment": "Lawful Good",
          "characterType": "NonPlayerCharacter" as const,
          "abilityScores": {
            "strength": 9,
            "dexterity": 14,
            "constitution": 12,
            "intelligence": 13,
            "wisdom": 15,
            "charisma": 12
          },
          "skills": ["Religion", "Insight", "Medicine"],
          "savingThrows": ["Wisdom", "Charisma"],
          "proficiencies": ["Mace", "Light Armor", "Herbalism Kit"],
          "traits": ["Channel Divinity", "Elven Accuracy"],
          "languages": ["Common", "Elvish"],
          "equipment": ["Mace", "Holy Symbol"],
          "level": 2,
          "experiencePoints": 300,
          "xpHistory": [
            { "amount": 300, "source": "Temple Service", "date": 1721000000 }
          ],
          "hitPoints": 15,
          "armorClass": 13,
          "proficiencyBonus": 2,
          "actions": [],
          "createdAt": 1722200000,
          "updatedAt": 1722200000
        },
        {
          "name": "Droop",
          "race": "Goblin",
          "class": "Commoner",
          "background": "Servant",
          "alignment": "Neutral",
          "characterType": "NonPlayerCharacter" as const,
          "abilityScores": {
            "strength": 8,
            "dexterity": 14,
            "constitution": 10,
            "intelligence": 8,
            "wisdom": 8,
            "charisma": 6
          },
          "skills": ["Stealth"],
          "savingThrows": [],
          "proficiencies": ["Shortbow"],
          "traits": ["Nimble Escape"],
          "languages": ["Goblin", "Common"],
          "equipment": ["Shortbow"],
          "level": 1,
          "experiencePoints": 0,
          "xpHistory": [],
          "hitPoints": 7,
          "armorClass": 13,
          "proficiencyBonus": 2,
          "actions": [],
          "createdAt": 1722200000,
          "updatedAt": 1722200000
        },
        {
          "name": "Sildar Hallwinter",
          "race": "Human",
          "class": "Fighter",
          "background": "Knight",
          "alignment": "Lawful Good",
          "characterType": "NonPlayerCharacter" as const,
          "abilityScores": {
            "strength": 15,
            "dexterity": 12,
            "constitution": 14,
            "intelligence": 11,
            "wisdom": 10,
            "charisma": 13
          },
          "skills": ["Athletics", "Persuasion"],
          "savingThrows": ["Strength", "Constitution"],
          "proficiencies": ["Longsword", "Chain Mail", "Shield"],
          "traits": ["Second Wind"],
          "languages": ["Common"],
          "equipment": ["Longsword", "Chain Mail", "Shield"],
          "level": 3,
          "experiencePoints": 900,
          "xpHistory": [
            { "amount": 900, "source": "Guard Duty", "date": 1721100000 }
          ],
          "hitPoints": 27,
          "armorClass": 18,
          "proficiencyBonus": 2,
          "actions": [],
          "createdAt": 1722200000,
          "updatedAt": 1722200000
        },
        {
          "name": "Halia Thornton",
          "race": "Human",
          "class": "Rogue",
          "background": "Guildmaster",
          "alignment": "Neutral Evil",
          "characterType": "NonPlayerCharacter" as const,
          "abilityScores": {
            "strength": 10,
            "dexterity": 15,
            "constitution": 12,
            "intelligence": 14,
            "wisdom": 11,
            "charisma": 16
          },
          "skills": ["Deception", "Persuasion", "Stealth", "Investigation"],
          "savingThrows": ["Dexterity", "Intelligence"],
          "proficiencies": [
            "Dagger",
            "Thieves' Tools",
            "Light Armor",
            "Forgery Kit"
          ],
          "traits": ["Cunning Action", "Sneak Attack"],
          "languages": ["Common", "Thieves' Cant"],
          "equipment": ["Dagger", "Leather Armor"],
          "level": 3,
          "experiencePoints": 900,
          "xpHistory": [
            { "amount": 900, "source": "Guild Operations", "date": 1721200000 }
          ],
          "hitPoints": 18,
          "armorClass": 14,
          "proficiencyBonus": 2,
          "actions": [],
          "createdAt": 1722200000,
          "updatedAt": 1722200000
        }
      ]
    };

    const results = {
      npcs: [] as any[]
    };

    // Import NPCs
    for (const npc of importData.npcs) {
      const { characterType, ...npcData } = npc;
      const npcId = await ctx.db.insert("npcs", {
        ...npcData,
        characterType,
        userId: user._id,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      results.npcs.push(npcId);
    }

    return results;
  },
}); 