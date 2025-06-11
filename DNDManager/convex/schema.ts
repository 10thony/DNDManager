import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    createdAt: v.number(),
  }),
  playerCharacters: defineTable({
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
    actions: v.array(v.id("actions")), // Reference to available actions
    createdAt: v.number(),
  }),
  actions: defineTable({
    name: v.string(),
    description: v.string(),
    actionCost: v.union(
      v.literal("Action"),
      v.literal("Bonus Action"),
      v.literal("Reaction"),
      v.literal("No Action"),
      v.literal("Special")
    ),
    type: v.union(
      v.literal("MELEE_ATTACK"),
      v.literal("RANGED_ATTACK"),
      v.literal("SPELL"),
      v.literal("COMMONLY_AVAILABLE_UTILITY"),
      v.literal("CLASS_FEATURE"),
      v.literal("BONUS_ACTION"),
      v.literal("REACTION"),
      v.literal("OTHER")
    ),
    requiresConcentration: v.boolean(),
    sourceBook: v.string(),
    // Attack specific fields
    attackBonusAbilityScore: v.optional(v.string()),
    isProficient: v.optional(v.boolean()),
    damageRolls: v.optional(v.array(v.object({
      dice: v.object({
        count: v.number(),
        type: v.union(
          v.literal("D4"),
          v.literal("D6"),
          v.literal("D8"),
          v.literal("D10"),
          v.literal("D12"),
          v.literal("D20")
        )
      }),
      modifier: v.number(),
      damageType: v.union(
        v.literal("BLUDGEONING"),
        v.literal("PIERCING"),
        v.literal("SLASHING"),
        v.literal("ACID"),
        v.literal("COLD"),
        v.literal("FIRE"),
        v.literal("FORCE"),
        v.literal("LIGHTNING"),
        v.literal("NECROTIC"),
        v.literal("POISON"),
        v.literal("PSYCHIC"),
        v.literal("RADIANT"),
        v.literal("THUNDER")
      )
    }))),
    // Spell specific fields
    spellLevel: v.optional(v.union(
      v.literal(0),
      v.literal(1),
      v.literal(2),
      v.literal(3),
      v.literal(4),
      v.literal(5),
      v.literal(6),
      v.literal(7),
      v.literal(8),
      v.literal(9)
    )),
    castingTime: v.optional(v.string()),
    range: v.optional(v.string()),
    components: v.optional(v.object({
      verbal: v.boolean(),
      somatic: v.boolean(),
      material: v.optional(v.string())
    })),
    duration: v.optional(v.string()),
    savingThrow: v.optional(v.object({
      ability: v.string(),
      onSave: v.string()
    })),
    spellEffectDescription: v.optional(v.string()),
    // Class feature specific fields
    className: v.optional(v.string()),
    usesPer: v.optional(v.union(
      v.literal("Short Rest"),
      v.literal("Long Rest"),
      v.literal("Day"),
      v.literal("Special")
    )),
    maxUses: v.optional(v.union(v.number(), v.string())),
    createdAt: v.number(),
  }),
  items: defineTable({
    name: v.string(),
    type: v.union(
      v.literal("Weapon"),
      v.literal("Armor"),
      v.literal("Potion"),
      v.literal("Scroll"),
      v.literal("Wondrous Item"),
      v.literal("Ring"),
      v.literal("Rod"),
      v.literal("Staff"),
      v.literal("Wand"),
      v.literal("Ammunition"),
      v.literal("Adventuring Gear"),
      v.literal("Tool"),
      v.literal("Mount"),
      v.literal("Vehicle"),
      v.literal("Treasure"),
      v.literal("Other")
    ),
    rarity: v.union(
      v.literal("Common"),
      v.literal("Uncommon"),
      v.literal("Rare"),
      v.literal("Very Rare"),
      v.literal("Legendary"),
      v.literal("Artifact"),
      v.literal("Unique")
    ),
    description: v.string(),
    effects: v.optional(v.string()),
    weight: v.optional(v.number()),
    cost: v.optional(v.number()),
    attunement: v.optional(v.boolean()),
  }),
  maps: defineTable({
    name: v.string(),
    width: v.number(),
    height: v.number(),
    cells: v.array(v.object({
      x: v.number(),
      y: v.number(),
      state: v.union(
        v.literal("inbounds"),
        v.literal("outbounds"),
        v.literal("occupied")
      )
    })),
    createdBy: v.string(), // clerkId of the creator
    createdAt: v.number(),
    updatedAt: v.number(),
  }),
  locations: defineTable({
    campaignId: v.id("campaigns"),
    name: v.string(),
    type: v.union(
      v.literal("Town"),
      v.literal("City"),
      v.literal("Village"),
      v.literal("Dungeon"),
      v.literal("Castle"),
      v.literal("Forest"),
      v.literal("Mountain"),
      v.literal("Temple"),
      v.literal("Ruins"),
      v.literal("Camp"),
      v.literal("Other")
    ),
    description: v.string(),
    notableNpcIds: v.array(v.id("npcs")),
    linkedLocations: v.array(v.id("locations")),
    interactionsAtLocation: v.array(v.id("interactions")),
    imageUrls: v.array(v.string()),
    secrets: v.string(),
    mapId: v.optional(v.id("maps")), // Use v.optional for the reference to the map
    creatorId: v.string(), // clerkId of the creator
    createdAt: v.number(),
    updatedAt: v.number(),
  }),
  campaigns: defineTable({
    name: v.string(),
    creatorId: v.string(), // clerkId of the creator
    createdAt: v.number(),
  }),
  npcs: defineTable({
    name: v.string(),
    creatorId: v.string(), // clerkId of the creator
    createdAt: v.number(),
  }),
  interactions: defineTable({
    name: v.string(),
    creatorId: v.string(), // clerkId of the creator
    createdAt: v.number(),
  }),
});
