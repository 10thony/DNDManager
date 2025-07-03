import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createMonster = mutation({
  args: {
    campaignId: v.optional(v.id("campaigns")),
    name: v.string(),
    source: v.optional(v.string()),
    page: v.optional(v.string()),
    size: v.union(
      v.literal("Tiny"),
      v.literal("Small"),
      v.literal("Medium"),
      v.literal("Large"),
      v.literal("Huge"),
      v.literal("Gargantuan")
    ),
    type: v.string(),
    tags: v.optional(v.array(v.string())),
    alignment: v.string(),
    armorClass: v.number(),
    armorType: v.optional(v.string()),
    hitPoints: v.number(),
    hitDice: v.object({
      count: v.number(),
      die: v.union(
        v.literal("d4"),
        v.literal("d6"),
        v.literal("d8"),
        v.literal("d10"),
        v.literal("d12")
      ),
    }),
    proficiencyBonus: v.number(),
    speed: v.object({
      walk: v.optional(v.string()),
      swim: v.optional(v.string()),
      fly: v.optional(v.string()),
      burrow: v.optional(v.string()),
      climb: v.optional(v.string()),
    }),
    abilityScores: v.object({
      strength: v.number(),
      dexterity: v.number(),
      constitution: v.number(),
      intelligence: v.number(),
      wisdom: v.number(),
      charisma: v.number(),
    }),
    savingThrows: v.optional(v.array(v.string())),
    skills: v.optional(v.array(v.string())),
    damageVulnerabilities: v.optional(v.array(v.string())),
    damageResistances: v.optional(v.array(v.string())),
    damageImmunities: v.optional(v.array(v.string())),
    conditionImmunities: v.optional(v.array(v.string())),
    senses: v.object({
      darkvision: v.optional(v.string()),
      blindsight: v.optional(v.string()),
      tremorsense: v.optional(v.string()),
      truesight: v.optional(v.string()),
      passivePerception: v.number(),
    }),
    languages: v.optional(v.string()),
    challengeRating: v.string(),
    experiencePoints: v.optional(v.number()),
    traits: v.optional(
      v.array(
        v.object({
          name: v.string(),
          description: v.string(),
        })
      )
    ),
    actions: v.optional(
      v.array(
        v.object({
          name: v.string(),
          description: v.string(),
        })
      )
    ),
    reactions: v.optional(
      v.array(
        v.object({
          name: v.string(),
          description: v.string(),
        })
      )
    ),
    legendaryActions: v.optional(
      v.array(
        v.object({
          name: v.string(),
          description: v.string(),
        })
      )
    ),
    lairActions: v.optional(
      v.array(
        v.object({
          name: v.string(),
          description: v.string(),
        })
      )
    ),
    regionalEffects: v.optional(
      v.array(
        v.object({
          name: v.string(),
          description: v.string(),
        })
      )
    ),
    environment: v.optional(v.array(v.string())),
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

    const { clerkId, ...monsterData } = args;
    const monsterId = await ctx.db.insert("monsters", {
      ...monsterData,
      userId: user._id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    return monsterId;
  },
});

export const getAllMonsters = query({
  handler: async (ctx) => {
    return await ctx.db.query("monsters").order("desc").collect();
  },
});

export const getMonsterById = query({
  args: { id: v.id("monsters") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getMonstersByCampaign = query({
  args: { campaignId: v.id("campaigns") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("monsters")
      .filter((q) => q.eq(q.field("campaignId"), args.campaignId))
      .order("desc")
      .collect();
  },
});

export const getUnassignedMonsters = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("monsters")
      .filter((q) => q.eq(q.field("campaignId"), undefined))
      .order("desc")
      .collect();
  },
});

export const deleteMonster = mutation({
  args: { id: v.id("monsters") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const updateMonster = mutation({
  args: {
    id: v.id("monsters"),
    campaignId: v.optional(v.id("campaigns")),
    name: v.optional(v.string()),
    source: v.optional(v.string()),
    page: v.optional(v.string()),
    size: v.optional(v.union(
      v.literal("Tiny"),
      v.literal("Small"),
      v.literal("Medium"),
      v.literal("Large"),
      v.literal("Huge"),
      v.literal("Gargantuan")
    )),
    type: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    alignment: v.optional(v.string()),
    armorClass: v.optional(v.number()),
    armorType: v.optional(v.string()),
    hitPoints: v.optional(v.number()),
    hitDice: v.optional(v.object({
      count: v.number(),
      die: v.union(
        v.literal("d4"),
        v.literal("d6"),
        v.literal("d8"),
        v.literal("d10"),
        v.literal("d12")
      ),
    })),
    proficiencyBonus: v.optional(v.number()),
    speed: v.optional(v.object({
      walk: v.optional(v.string()),
      swim: v.optional(v.string()),
      fly: v.optional(v.string()),
      burrow: v.optional(v.string()),
      climb: v.optional(v.string()),
    })),
    abilityScores: v.optional(v.object({
      strength: v.number(),
      dexterity: v.number(),
      constitution: v.number(),
      intelligence: v.number(),
      wisdom: v.number(),
      charisma: v.number(),
    })),
    savingThrows: v.optional(v.array(v.string())),
    skills: v.optional(v.array(v.string())),
    damageVulnerabilities: v.optional(v.array(v.string())),
    damageResistances: v.optional(v.array(v.string())),
    damageImmunities: v.optional(v.array(v.string())),
    conditionImmunities: v.optional(v.array(v.string())),
    senses: v.optional(v.object({
      darkvision: v.optional(v.string()),
      blindsight: v.optional(v.string()),
      tremorsense: v.optional(v.string()),
      truesight: v.optional(v.string()),
      passivePerception: v.number(),
    })),
    languages: v.optional(v.string()),
    challengeRating: v.optional(v.string()),
    experiencePoints: v.optional(v.number()),
    traits: v.optional(
      v.array(
        v.object({
          name: v.string(),
          description: v.string(),
        })
      )
    ),
    actions: v.optional(
      v.array(
        v.object({
          name: v.string(),
          description: v.string(),
        })
      )
    ),
    reactions: v.optional(
      v.array(
        v.object({
          name: v.string(),
          description: v.string(),
        })
      )
    ),
    legendaryActions: v.optional(
      v.array(
        v.object({
          name: v.string(),
          description: v.string(),
        })
      )
    ),
    lairActions: v.optional(
      v.array(
        v.object({
          name: v.string(),
          description: v.string(),
        })
      )
    ),
    regionalEffects: v.optional(
      v.array(
        v.object({
          name: v.string(),
          description: v.string(),
        })
      )
    ),
    environment: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

export const bulkCreateMonsters = mutation({
  args: {
    monsters: v.array(v.object({
      campaignId: v.optional(v.id("campaigns")),
      name: v.string(),
      source: v.optional(v.string()),
      page: v.optional(v.string()),
      size: v.union(
        v.literal("Tiny"),
        v.literal("Small"),
        v.literal("Medium"),
        v.literal("Large"),
        v.literal("Huge"),
        v.literal("Gargantuan")
      ),
      type: v.string(),
      tags: v.optional(v.array(v.string())),
      alignment: v.string(),
      armorClass: v.number(),
      armorType: v.optional(v.string()),
      hitPoints: v.number(),
      hitDice: v.object({
        count: v.number(),
        die: v.union(
          v.literal("d4"),
          v.literal("d6"),
          v.literal("d8"),
          v.literal("d10"),
          v.literal("d12")
        ),
      }),
      proficiencyBonus: v.number(),
      speed: v.object({
        walk: v.optional(v.string()),
        swim: v.optional(v.string()),
        fly: v.optional(v.string()),
        burrow: v.optional(v.string()),
        climb: v.optional(v.string()),
      }),
      abilityScores: v.object({
        strength: v.number(),
        dexterity: v.number(),
        constitution: v.number(),
        intelligence: v.number(),
        wisdom: v.number(),
        charisma: v.number(),
      }),
      savingThrows: v.optional(v.array(v.string())),
      skills: v.optional(v.array(v.string())),
      damageVulnerabilities: v.optional(v.array(v.string())),
      damageResistances: v.optional(v.array(v.string())),
      damageImmunities: v.optional(v.array(v.string())),
      conditionImmunities: v.optional(v.array(v.string())),
      senses: v.object({
        darkvision: v.optional(v.string()),
        blindsight: v.optional(v.string()),
        tremorsense: v.optional(v.string()),
        truesight: v.optional(v.string()),
        passivePerception: v.number(),
      }),
      languages: v.optional(v.string()),
      challengeRating: v.string(),
      experiencePoints: v.optional(v.number()),
      traits: v.optional(
        v.array(
          v.object({
            name: v.string(),
            description: v.string(),
          })
        )
      ),
      actions: v.optional(
        v.array(
          v.object({
            name: v.string(),
            description: v.string(),
          })
        )
      ),
      reactions: v.optional(
        v.array(
          v.object({
            name: v.string(),
            description: v.string(),
          })
        )
      ),
      legendaryActions: v.optional(
        v.array(
          v.object({
            name: v.string(),
            description: v.string(),
          })
        )
      ),
      lairActions: v.optional(
        v.array(
          v.object({
            name: v.string(),
            description: v.string(),
          })
        )
      ),
      regionalEffects: v.optional(
        v.array(
          v.object({
            name: v.string(),
            description: v.string(),
          })
        )
      ),
      environment: v.optional(v.array(v.string())),
    })),
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

    const monsterIds = [];
    for (const monster of args.monsters) {
      const monsterId = await ctx.db.insert("monsters", {
        ...monster,
        userId: user._id,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      monsterIds.push(monsterId);
    }
    return monsterIds;
  },
}); 