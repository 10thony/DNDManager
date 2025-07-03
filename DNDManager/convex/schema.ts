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
    role: v.union(v.literal("admin"), v.literal("user")),
  }),
  playerCharacters: defineTable({
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
    factionId: v.optional(v.id("factions")),
    userId: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  }),
  npcs: defineTable({
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
    userId: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
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
    className: v.optional(v.string()),
    usesPer: v.optional(v.union(
      v.literal("Short Rest"),
      v.literal("Long Rest"),
      v.literal("Day"),
      v.literal("Special")
    )),
    maxUses: v.optional(v.union(v.number(), v.string())),
    userId: v.id("users"),
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
    userId: v.id("users"),
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
    createdBy: v.id("users"),
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
    mapId: v.optional(v.id("maps")),
    creatorId: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  }),
  campaigns: defineTable({
    name: v.string(),
    creatorId: v.id("users"),
    description: v.optional(v.string()),
    worldSetting: v.optional(v.string()),
    startDate: v.optional(v.number()),
    isPublic: v.boolean(),
    dmId: v.string(),
    players: v.optional(v.array(v.string())),
  
    participantPlayerCharacterIds: v.optional(
      v.array(v.id("playerCharacters"))
    ),
    participantUserIds: v.optional(v.array(v.id("users"))),
    tags: v.optional(v.array(v.id("tags"))),

    locationIds: v.optional(v.array(v.id("locations"))),
    questIds: v.optional(v.array(v.id("quests"))),
    sessionIds: v.optional(v.array(v.id("sessions"))),
    npcIds: v.optional(v.array(v.id("npcs"))),
    factionIds: v.optional(v.array(v.id("factions"))),
    monsterIds: v.optional(v.array(v.id("monsters"))),
    spellIds: v.optional(v.array(v.id("spells"))),
    deityIds: v.optional(v.array(v.id("deities"))),
    journalIds: v.optional(v.array(v.id("journals"))),
    mediaAssetIds: v.optional(v.array(v.id("mediaAssets"))),
    storyArcIds: v.optional(v.array(v.id("storyArcs"))),
    milestoneIds: v.optional(v.array(v.id("milestones"))),
    timelineEventIds: v.optional(v.array(v.id("timelineEvents"))),
    activeInteractionId: v.optional(v.id("interactions")), // NEW FIELD
  
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  }),
  quests: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    campaignId: v.optional(v.id("campaigns")),
    creatorId: v.id("users"),
    status: v.union(
      v.literal("NotStarted"),
      v.literal("InProgress"),
      v.literal("Completed"),
      v.literal("Failed")
    ),
    locationId: v.optional(v.id("locations")),
    taskIds: v.array(v.id("questTasks")),
    requiredItemIds: v.optional(v.array(v.id("items"))),
    involvedNpcIds: v.optional(v.array(v.id("npcs"))),
    participantIds: v.optional(v.array(v.id("playerCharacters"))),
    interactions: v.optional(v.array(v.id("interactions"))),
    rewards: v.optional(
      v.object({
        xp: v.optional(v.number()),
        gold: v.optional(v.number()),
        itemIds: v.optional(v.array(v.id("items"))),
      })
    ),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  }),
  questTasks: defineTable({
    questId: v.id("quests"),
    title: v.string(),
    description: v.optional(v.string()),
    type: v.union(
      v.literal("Fetch"),
      v.literal("Kill"),
      v.literal("Speak"),
      v.literal("Explore"),
      v.literal("Puzzle"),
      v.literal("Deliver"),
      v.literal("Escort"),
      v.literal("Custom")
    ),
    status: v.union(
      v.literal("NotStarted"),
      v.literal("InProgress"),
      v.literal("Completed"),
      v.literal("Failed")
    ),
    dependsOn: v.optional(v.array(v.id("questTasks"))),
    assignedTo: v.optional(v.array(v.id("playerCharacters"))),
    locationId: v.optional(v.id("locations")),
    targetNpcId: v.optional(v.id("npcs")),
    requiredItemIds: v.optional(v.array(v.id("items"))),
    interactions: v.optional(v.array(v.id("interactions"))),
    userId: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  }),
  interactions: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    creatorId: v.id("users"),
    campaignId: v.optional(v.id("campaigns")),
    
    // NEW FIELDS FOR LIVE INTERACTIONS
    dmUserId: v.id("users"), // DM controlling the interaction
    relatedLocationId: v.optional(v.id("locations")), // Rename from questId
    relatedQuestId: v.optional(v.id("quests")), // Keep for quest linking
    questTaskId: v.optional(v.id("questTasks")),
    status: v.union(
      v.literal("PENDING_INITIATIVE"),
      v.literal("INITIATIVE_ROLLED"), 
      v.literal("WAITING_FOR_PLAYER_TURN"),
      v.literal("PROCESSING_PLAYER_ACTION"),
      v.literal("DM_REVIEW"),
      v.literal("COMPLETED"),
      v.literal("CANCELLED")
    ),
    initiativeOrder: v.optional(v.array(v.object({
      entityId: v.string(),
      entityType: v.union(v.literal("playerCharacter"), v.literal("npc"), v.literal("monster")),
      initiativeRoll: v.number()
    }))),
    currentInitiativeIndex: v.optional(v.number()),
    participantMonsterIds: v.optional(v.array(v.id("monsters"))),
    participantNpcIds: v.optional(v.array(v.id("npcs"))),
    participantPlayerCharacterIds: v.optional(v.array(v.id("playerCharacters"))),
    interactionLog: v.optional(v.array(v.any())),
    interactionState: v.optional(v.any()),
    rewardItemIds: v.optional(v.array(v.id("items"))),
    xpAwards: v.optional(v.array(v.object({
      playerCharacterId: v.id("playerCharacters"),
      xp: v.number()
    }))),
    playerCharacterIds: v.optional(v.array(v.id("playerCharacters"))),
    npcIds: v.optional(v.array(v.id("npcs"))),
    monsterIds: v.optional(v.array(v.id("monsters"))),
    timelineEventIds: v.optional(v.array(v.id("timelineEvents"))),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  }),
  playerActions: defineTable({
    interactionId: v.id("interactions"),
    playerCharacterId: v.id("playerCharacters"),
    actionDescription: v.string(),
    actionType: v.union(
      v.literal("Dialogue"),
      v.literal("CombatAction"), 
      v.literal("PuzzleInput"),
      v.literal("Custom")
    ),
    submittedAt: v.number(),
    status: v.union(
      v.literal("PENDING"),
      v.literal("DM_REVIEW"),
      v.literal("RESOLVED"),
      v.literal("SKIPPED")
    ),
    dmNotes: v.optional(v.string()),
    associatedItemId: v.optional(v.id("items")),
    createdAt: v.number(),
  }),
  sessions: defineTable({
    campaignId: v.id("campaigns"),
    date: v.number(),
    participantPlayerCharacterIds: v.array(v.id("playerCharacters")),
    participantUserIds: v.array(v.id("users")),
    summary: v.optional(v.string()),
    xpAwards: v.optional(
      v.array(
        v.object({
          playerCharacterId: v.id("playerCharacters"),
          xp: v.number(),
        })
      )
    ),
    lootAwards: v.optional(
      v.array(
        v.object({
          playerCharacterId: v.id("playerCharacters"),
          gold: v.optional(v.number()),
          itemIds: v.optional(v.array(v.id("items"))),
        })
      )
    ),
    notes: v.optional(v.string()),
    userId: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  }),
  timelineEvents: defineTable({
    campaignId: v.id("campaigns"),
    title: v.string(),
    description: v.string(),
    date: v.number(),
    type: v.optional(
      v.union(
        v.literal("Battle"),
        v.literal("Alliance"),
        v.literal("Discovery"),
        v.literal("Disaster"),
        v.literal("Political"),
        v.literal("Cultural"),
        v.literal("Custom")
      )
    ),
    relatedLocationIds: v.optional(v.array(v.id("locations"))),
    relatedNpcIds: v.optional(v.array(v.id("npcs"))),
    relatedFactionIds: v.optional(v.array(v.id("factions"))),
    relatedQuestIds: v.optional(v.array(v.id("quests"))),
    userId: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  }),
  factions: defineTable({
    campaignId: v.id("campaigns"),
    name: v.string(),
    description: v.string(),
    leaderNpcIds: v.optional(v.array(v.id("npcs"))),
    alliedFactionIds: v.optional(v.array(v.id("factions"))),
    enemyFactionIds: v.optional(v.array(v.id("factions"))),
    goals: v.optional(v.array(v.string())),
    reputation: v.optional(
      v.array(
        v.object({
          playerCharacterId: v.id("playerCharacters"),
          score: v.number(),
        })
      )
    ),
    userId: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  }),
  monsters: defineTable({
    // link to campaign
    campaignId: v.optional(v.id("campaigns")),

    // basic identification
    name: v.string(),
    source: v.optional(v.string()),
    page: v.optional(v.string()),

    // use our shared size type here
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

    userId: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  }),
  spells: defineTable({
    campaignId: v.id("campaigns"),
    name: v.string(),
    level: v.union(
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
    ),
    school: v.union(
      v.literal("Abjuration"),
      v.literal("Conjuration"),
      v.literal("Divination"),
      v.literal("Enchantment"),
      v.literal("Evocation"),
      v.literal("Illusion"),
      v.literal("Necromancy"),
      v.literal("Transmutation")
    ),
    classes: v.array(v.string()),
    castingTime: v.string(),
    range: v.string(),
    components: v.object({
      verbal: v.boolean(),
      somatic: v.boolean(),
      material: v.optional(v.string()),
    }),
    ritual: v.boolean(),
    concentration: v.boolean(),
    duration: v.string(),
    description: v.string(),
    higherLevel: v.optional(v.string()),
    source: v.string(),
    userId: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  }),
  deities: defineTable({
    campaignId: v.id("campaigns"),
    name: v.string(),
    alignment: v.string(),
    domains: v.array(v.string()),
    symbol: v.string(),
    description: v.string(),
    relationships: v.optional(
      v.array(
        v.object({
          deityId: v.id("deities"),
          relationship: v.string(),
        })
      )
    ),
    userId: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  }),
  journals: defineTable({
    campaignId: v.id("campaigns"),
    title: v.string(),
    content: v.string(),
    authorUserId: v.id("users"),
    authorPlayerCharacterId: v.optional(v.id("playerCharacters")),
    dateCreated: v.number(),
    lastEdited: v.optional(v.number()),
  }),
  mediaAssets: defineTable({
    campaignId: v.id("campaigns"),
    name: v.string(),
    type: v.union(
      v.literal("Image"),
      v.literal("Audio"),
      v.literal("Video"),
      v.literal("Map"),
      v.literal("Handout"),
      v.literal("Other")
    ),
    url: v.string(),
    description: v.optional(v.string()),
    tags: v.optional(v.array(v.id("tags"))),
    uploadedBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  }),
  storyArcs: defineTable({
    campaignId: v.id("campaigns"),
    name: v.string(),
    description: v.string(),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    relatedQuestIds: v.optional(v.array(v.id("quests"))),
    relatedEventIds: v.optional(v.array(v.id("timelineEvents"))),
    tags: v.optional(v.array(v.id("tags"))),
    userId: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  }),
  tags: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    color: v.optional(v.string()),
    createdBy: v.id("users"),
    createdAt: v.number(),
  }),
  milestones: defineTable({
    campaignId: v.id("campaigns"),
    name: v.string(),
    description: v.string(),
    targetDate: v.number(),
    achieved: v.boolean(),
    achievedAt: v.optional(v.number()),
    relatedEventIds: v.optional(v.array(v.id("timelineEvents"))),
    relatedQuestIds: v.optional(v.array(v.id("quests"))),
    userId: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  }),
  userSessions: defineTable({
    clerkId: v.string(),
    startTime: v.number(),
    lastActivity: v.number(),
    isActive: v.boolean(),
    userAgent: v.optional(v.string()),
    ipAddress: v.optional(v.string()),
  }),
  userSessionActivities: defineTable({
    sessionId: v.id("userSessions"),
    clerkId: v.string(),
    activityType: v.string(),
    details: v.any(),
    timestamp: v.number(),
  }),
});
