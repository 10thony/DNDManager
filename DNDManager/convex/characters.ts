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
    factionId: v.optional(v.id("factions")),
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

    const { characterType, clerkId, ...characterData } = args;
    
    if (characterType === "NonPlayerCharacter") {
      // Create NPC in the npcs table
      const npcId = await ctx.db.insert("npcs", {
        ...characterData,
        characterType,
        userId: user._id,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      return npcId;
    } else {
      // Create player character in the playerCharacters table
      const characterId = await ctx.db.insert("playerCharacters", {
        ...characterData,
        userId: user._id,
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

export const getCharactersByUserId = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("playerCharacters")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .order("desc")
      .collect();
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
    experiencePoints: v.optional(v.float64()),
    xpHistory: v.optional(
      v.array(
        v.object({
          amount: v.float64(),
          source: v.string(),
          date: v.float64(),
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
    amount: v.float64(),
    source: v.string(),
  },
  handler: async (ctx, args) => {
    const character = await ctx.db.get(args.id);
    if (!character) {
      throw new Error("Character not found");
    }

    const currentXP = Number(character.experiencePoints || 0);
    const newXP = currentXP + Number(args.amount);
    
    const currentHistory = character.xpHistory || [];
    const newHistoryEntry = {
      amount: Number(args.amount),
      source: args.source,
      date: Number(Date.now()),
    };

    await ctx.db.patch(args.id, {
      experiencePoints: newXP,
      xpHistory: [...currentHistory, newHistoryEntry],
      updatedAt: Number(Date.now()),
    });
  },
});

export const importPlayerData = mutation({
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

    // Import data from the JSON file
    const importData = {
      "playerCharacters": [
        {
          "name": "Elira Moonshadow",
          "race": "Half-Elf",
          "class": "Bard",
          "background": "Entertainer",
          "alignment": "Chaotic Good",
          "characterType": "PlayerCharacter" as const,
          "abilityScores": {
            "strength": 10,
            "dexterity": 14,
            "constitution": 12,
            "intelligence": 13,
            "wisdom": 10,
            "charisma": 17
          },
          "skills": ["Performance", "Persuasion", "Deception", "Insight", "Acrobatics"],
          "savingThrows": ["Dexterity", "Charisma"],
          "proficiencies": ["Lute", "Dagger", "Light Armor", "Simple Weapons"],
          "traits": ["Darkvision", "Fey Ancestry", "Jack of All Trades"],
          "languages": ["Common", "Elvish", "Sylvan"],
          "equipment": ["Rapier", "Lute", "Leather Armor", "Entertainer's Pack"],
          "level": 3,
          "experiencePoints": 900,
          "xpHistory": [
            { "amount": 300, "source": "Session 1", "date": 1719800000 },
            { "amount": 600, "source": "Session 2", "date": 1720400000 }
          ],
          "hitPoints": 21,
          "armorClass": 14,
          "proficiencyBonus": 2,
          "actions": [],
          "factionId": undefined,
          "createdAt": 1722200000,
          "updatedAt": 1722200000
        },
        {
          "name": "Thorin Ironfist",
          "race": "Dwarf",
          "class": "Fighter",
          "background": "Soldier",
          "alignment": "Lawful Neutral",
          "characterType": "PlayerCharacter" as const,
          "abilityScores": {
            "strength": 16,
            "dexterity": 12,
            "constitution": 16,
            "intelligence": 10,
            "wisdom": 12,
            "charisma": 8
          },
          "skills": ["Athletics", "Intimidation", "Survival", "Perception"],
          "savingThrows": ["Strength", "Constitution"],
          "proficiencies": [
            "Battleaxe",
            "Warhammer",
            "All Armor",
            "Shields",
            "Smith's Tools"
          ],
          "traits": ["Darkvision", "Dwarven Resilience", "Stonecunning"],
          "languages": ["Common", "Dwarvish"],
          "equipment": [
            "Chain Mail",
            "Shield",
            "Battleaxe",
            "Handaxe",
            "Explorer's Pack"
          ],
          "level": 3,
          "experiencePoints": 900,
          "xpHistory": [
            { "amount": 300, "source": "Session 1", "date": 1719800000 },
            { "amount": 600, "source": "Session 2", "date": 1720400000 }
          ],
          "hitPoints": 32,
          "armorClass": 18,
          "proficiencyBonus": 2,
          "actions": [],
          "factionId": undefined,
          "createdAt": 1722200000,
          "updatedAt": 1722200000
        },
        {
          "name": "Seraphina Willow",
          "race": "Human",
          "class": "Cleric",
          "background": "Acolyte",
          "alignment": "Neutral Good",
          "characterType": "PlayerCharacter" as const,
          "abilityScores": {
            "strength": 12,
            "dexterity": 10,
            "constitution": 14,
            "intelligence": 12,
            "wisdom": 16,
            "charisma": 13
          },
          "skills": ["Medicine", "Insight", "Religion", "History"],
          "savingThrows": ["Wisdom", "Charisma"],
          "proficiencies": [
            "Mace",
            "Light Armor",
            "Medium Armor",
            "Shields",
            "Herbalism Kit"
          ],
          "traits": ["Channel Divinity", "Divine Domain: Life"],
          "languages": ["Common", "Celestial"],
          "equipment": [
            "Mace",
            "Shield",
            "Chain Shirt",
            "Holy Symbol",
            "Priest's Pack"
          ],
          "level": 3,
          "experiencePoints": 900,
          "xpHistory": [
            { "amount": 300, "source": "Session 1", "date": 1719800000 },
            { "amount": 600, "source": "Session 2", "date": 1720400000 }
          ],
          "hitPoints": 24,
          "armorClass": 17,
          "proficiencyBonus": 2,
          "actions": [],
          "factionId": undefined,
          "createdAt": 1722200000,
          "updatedAt": 1722200000
        }
      ]
    };

    const results = {
      playerCharacters: [] as any[]
    };

    // Import player characters
    for (const character of importData.playerCharacters) {
      const { characterType, ...characterData } = character;
      const characterId = await ctx.db.insert("playerCharacters", {
        ...characterData,
        userId: user._id,
        characterType,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      results.playerCharacters.push(characterId);
    }

    return results;
  },
});

export const importPlayerAndNPCData = mutation({
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

    // Import data from the JSON file
    const importData = {
      "playerCharacters": [
        {
          "name": "Elira Moonshadow",
          "race": "Half-Elf",
          "class": "Bard",
          "background": "Entertainer",
          "alignment": "Chaotic Good",
          "characterType": "PlayerCharacter" as const,
          "abilityScores": {
            "strength": 10,
            "dexterity": 14,
            "constitution": 12,
            "intelligence": 13,
            "wisdom": 10,
            "charisma": 17
          },
          "skills": ["Performance", "Persuasion", "Deception", "Insight", "Acrobatics"],
          "savingThrows": ["Dexterity", "Charisma"],
          "proficiencies": ["Lute", "Dagger", "Light Armor", "Simple Weapons"],
          "traits": ["Darkvision", "Fey Ancestry", "Jack of All Trades"],
          "languages": ["Common", "Elvish", "Sylvan"],
          "equipment": ["Rapier", "Lute", "Leather Armor", "Entertainer's Pack"],
          "level": 3,
          "experiencePoints": 900,
          "xpHistory": [
            { "amount": 300, "source": "Session 1", "date": 1719800000 },
            { "amount": 600, "source": "Session 2", "date": 1720400000 }
          ],
          "hitPoints": 21,
          "armorClass": 14,
          "proficiencyBonus": 2,
          "actions": [],
          "factionId": undefined,
          "createdAt": 1722200000,
          "updatedAt": 1722200000
        },
        {
          "name": "Thorin Ironfist",
          "race": "Dwarf",
          "class": "Fighter",
          "background": "Soldier",
          "alignment": "Lawful Neutral",
          "characterType": "PlayerCharacter" as const,
          "abilityScores": {
            "strength": 16,
            "dexterity": 12,
            "constitution": 16,
            "intelligence": 10,
            "wisdom": 12,
            "charisma": 8
          },
          "skills": ["Athletics", "Intimidation", "Survival", "Perception"],
          "savingThrows": ["Strength", "Constitution"],
          "proficiencies": [
            "Battleaxe",
            "Warhammer",
            "All Armor",
            "Shields",
            "Smith's Tools"
          ],
          "traits": ["Darkvision", "Dwarven Resilience", "Stonecunning"],
          "languages": ["Common", "Dwarvish"],
          "equipment": [
            "Chain Mail",
            "Shield",
            "Battleaxe",
            "Handaxe",
            "Explorer's Pack"
          ],
          "level": 3,
          "experiencePoints": 900,
          "xpHistory": [
            { "amount": 300, "source": "Session 1", "date": 1719800000 },
            { "amount": 600, "source": "Session 2", "date": 1720400000 }
          ],
          "hitPoints": 32,
          "armorClass": 18,
          "proficiencyBonus": 2,
          "actions": [],
          "factionId": undefined,
          "createdAt": 1722200000,
          "updatedAt": 1722200000
        },
        {
          "name": "Seraphina Willow",
          "race": "Human",
          "class": "Cleric",
          "background": "Acolyte",
          "alignment": "Neutral Good",
          "characterType": "PlayerCharacter" as const,
          "abilityScores": {
            "strength": 12,
            "dexterity": 10,
            "constitution": 14,
            "intelligence": 12,
            "wisdom": 16,
            "charisma": 13
          },
          "skills": ["Medicine", "Insight", "Religion", "History"],
          "savingThrows": ["Wisdom", "Charisma"],
          "proficiencies": [
            "Mace",
            "Light Armor",
            "Medium Armor",
            "Shields",
            "Herbalism Kit"
          ],
          "traits": ["Channel Divinity", "Divine Domain: Life"],
          "languages": ["Common", "Celestial"],
          "equipment": [
            "Mace",
            "Shield",
            "Chain Shirt",
            "Holy Symbol",
            "Priest's Pack"
          ],
          "level": 3,
          "experiencePoints": 900,
          "xpHistory": [
            { "amount": 300, "source": "Session 1", "date": 1719800000 },
            { "amount": 600, "source": "Session 2", "date": 1720400000 }
          ],
          "hitPoints": 24,
          "armorClass": 17,
          "proficiencyBonus": 2,
          "actions": [],
          "factionId": undefined,
          "createdAt": 1722200000,
          "updatedAt": 1722200000
        }
      ],
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
          "factionId": undefined,
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
          "factionId": undefined,
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
          "factionId": undefined,
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
          "factionId": undefined,
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
          "factionId": undefined,
          "createdAt": 1722200000,
          "updatedAt": 1722200000
        }
      ]
    };

    const results = {
      playerCharacters: [] as any[],
      npcs: [] as any[]
    };

    // Import player characters
    for (const character of importData.playerCharacters) {
      const { characterType, ...characterData } = character;
      const characterId = await ctx.db.insert("playerCharacters", {
        ...characterData,
        userId: user._id,
        characterType,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      results.playerCharacters.push(characterId);
    }

    // Import NPCs
    for (const npc of importData.npcs) {
      const { characterType, factionId, ...npcData } = npc;
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
