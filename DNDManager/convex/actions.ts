import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

type ActionType = "MELEE_ATTACK" | "RANGED_ATTACK" | "SPELL" | "COMMONLY_AVAILABLE_UTILITY" | "CLASS_FEATURE" | "BONUS_ACTION" | "REACTION" | "OTHER";
type ActionCost = "Action" | "Bonus Action" | "Reaction" | "No Action" | "Special";
type UsesPer = "Long Rest" | "Short Rest" | "Day" | "Special";
type DamageType = "BLUDGEONING" | "PIERCING" | "SLASHING" | "ACID" | "COLD" | "FIRE" | "FORCE" | "LIGHTNING" | "NECROTIC" | "POISON" | "PSYCHIC" | "RADIANT" | "THUNDER";
type DiceType = "D4" | "D6" | "D8" | "D10" | "D12" | "D20";

interface BaseAction {
  name: string;
  description: string;
  actionCost: ActionCost;
  type: ActionType;
  requiresConcentration: boolean;
  sourceBook: string;
}

interface ClassFeatureAction extends BaseAction {
  type: "CLASS_FEATURE";
  className: string;
  usesPer?: UsesPer;
  maxUses?: number | string;
  damageRolls?: {
    dice: {
      count: number;
      type: DiceType;
    };
    modifier: number;
    damageType: DamageType;
  }[];
}

interface SpellAction extends BaseAction {
  type: "SPELL";
  spellLevel: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
  castingTime: string;
  range: string;
  components: {
    verbal: boolean;
    somatic: boolean;
    material?: string;
  };
  duration: string;
  savingThrow?: {
    ability: string;
    onSave: string;
  };
  damageRolls?: {
    dice: {
      count: number;
      type: DiceType;
    };
    modifier: number;
    damageType: DamageType;
  }[];
}

interface UtilityAction extends BaseAction {
  type: "COMMONLY_AVAILABLE_UTILITY";
}

type Action = ClassFeatureAction | SpellAction | UtilityAction;

// Common Actions
const commonActions: UtilityAction[] = [
  {
    name: "Dash",
    description: "Gain additional movement equal to your speed for the current turn.",
    actionCost: "Action",
    type: "COMMONLY_AVAILABLE_UTILITY",
    requiresConcentration: false,
    sourceBook: "PHB",
  },
  {
    name: "Disengage",
    description: "Your movement doesn't provoke opportunity attacks for the rest of the turn.",
    actionCost: "Action",
    type: "COMMONLY_AVAILABLE_UTILITY",
    requiresConcentration: false,
    sourceBook: "PHB",
  },
  {
    name: "Dodge",
    description: "Until the start of your next turn, any attack roll made against you has disadvantage if you can see the attacker, and you make Dexterity saving throws with advantage.",
    actionCost: "Action",
    type: "COMMONLY_AVAILABLE_UTILITY",
    requiresConcentration: false,
    sourceBook: "PHB",
  },
  {
    name: "Help",
    description: "You can aid a friendly creature in attacking a creature within 5 feet of you. The target gains advantage on their next attack roll.",
    actionCost: "Action",
    type: "COMMONLY_AVAILABLE_UTILITY",
    requiresConcentration: false,
    sourceBook: "PHB",
  },
  {
    name: "Hide",
    description: "Make a Dexterity (Stealth) check in an attempt to hide.",
    actionCost: "Action",
    type: "COMMONLY_AVAILABLE_UTILITY",
    requiresConcentration: false,
    sourceBook: "PHB",
  },
  {
    name: "Ready",
    description: "Choose a trigger and an action to take in response to that trigger.",
    actionCost: "Action",
    type: "COMMONLY_AVAILABLE_UTILITY",
    requiresConcentration: true,
    sourceBook: "PHB",
  },
  {
    name: "Search",
    description: "Make a Wisdom (Perception) check to find something.",
    actionCost: "Action",
    type: "COMMONLY_AVAILABLE_UTILITY",
    requiresConcentration: false,
    sourceBook: "PHB",
  },
  {
    name: "Use an Object",
    description: "Interact with a second object or feature of the environment.",
    actionCost: "Action",
    type: "COMMONLY_AVAILABLE_UTILITY",
    requiresConcentration: false,
    sourceBook: "PHB",
  },
];

// Class-specific Actions
const classActions: Record<string, Action[]> = {
  Barbarian: [
    {
      name: "Rage",
      description: "Enter a rage that gives you advantage on Strength checks and saving throws, resistance to bludgeoning, piercing, and slashing damage, and bonus damage on melee weapon attacks.",
      actionCost: "Bonus Action",
      type: "CLASS_FEATURE",
      requiresConcentration: false,
      className: "Barbarian",
      usesPer: "Long Rest",
      maxUses: "Proficiency Bonus",
      sourceBook: "PHB",
    },
    {
      name: "Reckless Attack",
      description: "You can attack recklessly, giving you advantage on melee weapon attack rolls, but attack rolls against you have advantage until your next turn.",
      actionCost: "No Action",
      type: "CLASS_FEATURE",
      requiresConcentration: false,
      className: "Barbarian",
      sourceBook: "PHB",
    },
  ],
  Fighter: [
    {
      name: "Action Surge",
      description: "Take an additional action on your turn.",
      actionCost: "No Action",
      type: "CLASS_FEATURE",
      requiresConcentration: false,
      className: "Fighter",
      usesPer: "Short Rest",
      maxUses: 1,
      sourceBook: "PHB",
    },
    {
      name: "Second Wind",
      description: "Regain hit points equal to 1d10 + your fighter level.",
      actionCost: "Bonus Action",
      type: "CLASS_FEATURE",
      requiresConcentration: false,
      className: "Fighter",
      usesPer: "Short Rest",
      maxUses: 1,
      sourceBook: "PHB",
    },
  ],
  Rogue: [
    {
      name: "Cunning Action",
      description: "Take the Dash, Disengage, or Hide action as a bonus action.",
      actionCost: "Bonus Action",
      type: "CLASS_FEATURE",
      requiresConcentration: false,
      className: "Rogue",
      sourceBook: "PHB",
    },
    {
      name: "Sneak Attack",
      description: "Once per turn, you can deal extra damage to one creature you hit with an attack if you have advantage on the attack roll.",
      actionCost: "No Action",
      type: "CLASS_FEATURE",
      requiresConcentration: false,
      className: "Rogue",
      damageRolls: [{
        dice: { count: 1, type: "D6" },
        modifier: 0,
        damageType: "PIERCING"
      }],
      sourceBook: "PHB",
    },
  ],
  Wizard: [
    {
      name: "Arcane Recovery",
      description: "Regain some of your expended spell slots during a short rest.",
      actionCost: "Special",
      type: "CLASS_FEATURE",
      requiresConcentration: false,
      className: "Wizard",
      usesPer: "Long Rest",
      maxUses: 1,
      sourceBook: "PHB",
    },
    {
      name: "Fireball",
      description: "A bright streak flashes from your pointing finger to a point you choose within range and then blossoms with a low roar into an explosion of flame.",
      actionCost: "Action",
      type: "SPELL",
      requiresConcentration: false,
      spellLevel: 3,
      castingTime: "1 Action",
      range: "150 feet",
      components: {
        verbal: true,
        somatic: true,
        material: "A tiny ball of bat guano and sulfur"
      },
      duration: "Instantaneous",
      savingThrow: {
        ability: "DEX",
        onSave: "half damage"
      },
      damageRolls: [{
        dice: { count: 8, type: "D6" },
        modifier: 0,
        damageType: "FIRE"
      }],
      sourceBook: "PHB",
    },
  ],
  Cleric: [
    {
      name: "Divine Intervention",
      description: "Call on your deity to intervene on your behalf.",
      actionCost: "Action",
      type: "CLASS_FEATURE",
      requiresConcentration: false,
      className: "Cleric",
      usesPer: "Long Rest",
      maxUses: 1,
      sourceBook: "PHB",
    },
    {
      name: "Cure Wounds",
      description: "A creature you touch regains a number of hit points equal to 1d8 + your spellcasting ability modifier.",
      actionCost: "Action",
      type: "SPELL",
      requiresConcentration: false,
      spellLevel: 1,
      castingTime: "1 Action",
      range: "Touch",
      components: {
        verbal: true,
        somatic: true
      },
      duration: "Instantaneous",
      sourceBook: "PHB",
    },
  ],
};

// Mutation to populate the database with actions
export const populateActions = mutation({
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

    // Insert common actions
    for (const action of commonActions) {
      await ctx.db.insert("actions", {
        ...action,
        userId: user._id,
        createdAt: Date.now(),
      });
    }

    // Insert class-specific actions
    for (const [, actions] of Object.entries(classActions)) {
      for (const action of actions) {
        await ctx.db.insert("actions", {
          ...action,
          userId: user._id,
          createdAt: Date.now(),
        });
      }
    }
  },
});

// Query to get actions by their IDs
export const getActionsByIds = query({
  args: {
    ids: v.array(v.id("actions")),
  },
  handler: async (ctx, args) => {
    const actions = await Promise.all(
      args.ids.map(async (id) => {
        return await ctx.db.get(id);
      })
    );
    return actions.filter((action): action is NonNullable<typeof action> => action !== null);
  },
});

// Query to get actions by class
export const getActionsByClass = query({
  args: {
    className: v.string(),
  },
  handler: async (ctx, args) => {
    // Get all actions that are either common or specific to the class
    const actions = await ctx.db
      .query("actions")
      .filter((q) => 
        q.or(
          q.eq(q.field("type"), "COMMONLY_AVAILABLE_UTILITY"),
          q.and(
            q.eq(q.field("type"), "CLASS_FEATURE"),
            q.eq(q.field("className"), args.className)
          )
        )
      )
      .collect();
    
    return actions;
  },
});

// Query to get all actions
export const getAllActions = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("actions").collect();
  },
});

// Mutation to update an action
export const updateAction = mutation({
  args: {
    id: v.id("actions"),
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
    className: v.optional(v.string()),
    usesPer: v.optional(v.union(v.literal("Long Rest"), v.literal("Short Rest"), v.literal("Day"), v.literal("Special"))),
    maxUses: v.optional(v.union(v.string(), v.number())),
    spellLevel: v.optional(v.union(v.literal(0), v.literal(1), v.literal(2), v.literal(3), v.literal(4), v.literal(5), v.literal(6), v.literal(7), v.literal(8), v.literal(9))),
    castingTime: v.optional(v.string()),
    range: v.optional(v.string()),
    components: v.optional(v.object({
      verbal: v.boolean(),
      somatic: v.boolean(),
      material: v.optional(v.string()),
    })),
    duration: v.optional(v.string()),
    savingThrow: v.optional(v.object({
      ability: v.string(),
      onSave: v.string(),
    })),
  },
  handler: async (ctx, args) => {
    const { id, ...updateData } = args;
    return await ctx.db.patch(id, updateData);
  },
});

// Mutation to delete an action
export const deleteAction = mutation({
  args: {
    id: v.id("actions"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// Mutation to create a new action
export const createAction = mutation({
  args: {
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
    className: v.optional(v.string()),
    usesPer: v.optional(v.union(v.literal("Long Rest"), v.literal("Short Rest"), v.literal("Day"), v.literal("Special"))),
    maxUses: v.optional(v.union(v.string(), v.number())),
    spellLevel: v.optional(v.union(v.literal(0), v.literal(1), v.literal(2), v.literal(3), v.literal(4), v.literal(5), v.literal(6), v.literal(7), v.literal(8), v.literal(9))),
    castingTime: v.optional(v.string()),
    range: v.optional(v.string()),
    components: v.optional(v.object({
      verbal: v.boolean(),
      somatic: v.boolean(),
      material: v.optional(v.string()),
    })),
    duration: v.optional(v.string()),
    savingThrow: v.optional(v.object({
      ability: v.string(),
      onSave: v.string(),
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

    const { clerkId, ...actionData } = args;
    const action = {
      ...actionData,
      userId: user._id,
      createdAt: Date.now(),
    };
    return await ctx.db.insert("actions", action);
  },
});

// Mutation to load sample actions from JSON file
export const loadSampleActionsFromJson = mutation({
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

    // Check if user is admin
    if (user.role !== "admin") {
      throw new Error("Only admins can load sample data");
    }

    // Sample actions data from actions.json with proper typing
    const sampleActions: Array<{
      name: string;
      description: string;
      actionCost: "Action" | "Bonus Action" | "Reaction" | "No Action" | "Special";
      type: "MELEE_ATTACK" | "RANGED_ATTACK" | "SPELL" | "COMMONLY_AVAILABLE_UTILITY" | "CLASS_FEATURE" | "BONUS_ACTION" | "REACTION" | "OTHER";
      requiresConcentration: boolean;
      sourceBook: string;
      attackBonusAbilityScore?: string;
      isProficient?: boolean;
      damageRolls?: Array<{
        dice: {
          count: number;
          type: "D4" | "D6" | "D8" | "D10" | "D12" | "D20";
        };
        modifier: number;
        damageType: "BLUDGEONING" | "PIERCING" | "SLASHING" | "ACID" | "COLD" | "FIRE" | "FORCE" | "LIGHTNING" | "NECROTIC" | "POISON" | "PSYCHIC" | "RADIANT" | "THUNDER";
      }>;
      spellLevel?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
      castingTime?: string;
      range?: string;
      components?: {
        verbal: boolean;
        somatic: boolean;
        material?: string;
      };
      duration?: string;
      savingThrow?: {
        ability: string;
        onSave: string;
      };
      spellEffectDescription?: string;
      className?: string;
      usesPer?: "Short Rest" | "Long Rest" | "Day" | "Special";
      maxUses?: string | number;
    }> = [
      {
        name: "Melee Attack",
        description: "Make a single melee weapon attack.",
        actionCost: "Action" as const,
        type: "MELEE_ATTACK" as const,
        requiresConcentration: false,
        sourceBook: "Player's Handbook",
        attackBonusAbilityScore: "Strength",
        isProficient: true,
        damageRolls: [
          {
            dice: {
              count: 1,
              type: "D8" as const
            },
            modifier: 0,
            damageType: "SLASHING" as const
          }
        ]
      },
      {
        name: "Ranged Attack",
        description: "Make a single ranged weapon attack.",
        actionCost: "Action" as const,
        type: "RANGED_ATTACK" as const,
        requiresConcentration: false,
        sourceBook: "Player's Handbook",
        attackBonusAbilityScore: "Dexterity",
        isProficient: true,
        damageRolls: [
          {
            dice: {
              count: 1,
              type: "D8" as const
            },
            modifier: 0,
            damageType: "PIERCING" as const
          }
        ]
      },
      {
        name: "Cast a Spell",
        description: "Cast a spell you know or have prepared.",
        actionCost: "Action",
        type: "SPELL",
        requiresConcentration: false,
        sourceBook: "Player's Handbook"
      },
      {
        name: "Dash",
        description: "Gain extra movement equal to your speed for the current turn.",
        actionCost: "Action",
        type: "COMMONLY_AVAILABLE_UTILITY",
        requiresConcentration: false,
        sourceBook: "Player's Handbook"
      },
      {
        name: "Disengage",
        description: "Your movement doesn't provoke opportunity attacks for the rest of the turn.",
        actionCost: "Action",
        type: "COMMONLY_AVAILABLE_UTILITY",
        requiresConcentration: false,
        sourceBook: "Player's Handbook"
      },
      {
        name: "Dodge",
        description: "Until the start of your next turn, any attack roll made against you has disadvantage if you can see the attacker, and you make Dexterity saving throws with advantage.",
        actionCost: "Action",
        type: "COMMONLY_AVAILABLE_UTILITY",
        requiresConcentration: false,
        sourceBook: "Player's Handbook"
      },
      {
        name: "Help",
        description: "You can aid another creature in performing a task or attacking a foe.",
        actionCost: "Action",
        type: "COMMONLY_AVAILABLE_UTILITY",
        requiresConcentration: false,
        sourceBook: "Player's Handbook"
      },
      {
        name: "Hide",
        description: "Attempt to hide from creatures that can see you.",
        actionCost: "Action",
        type: "COMMONLY_AVAILABLE_UTILITY",
        requiresConcentration: false,
        sourceBook: "Player's Handbook"
      },
      {
        name: "Search",
        description: "Devote your attention to finding something.",
        actionCost: "Action",
        type: "COMMONLY_AVAILABLE_UTILITY",
        requiresConcentration: false,
        sourceBook: "Player's Handbook"
      },
      {
        name: "Ready",
        description: "Choose an action and a trigger. You can use your reaction to perform the action when the trigger occurs.",
        actionCost: "Action",
        type: "COMMONLY_AVAILABLE_UTILITY",
        requiresConcentration: false,
        sourceBook: "Player's Handbook"
      },
      {
        name: "Use an Object",
        description: "Interact with an object, such as opening a door or pulling a lever.",
        actionCost: "Action",
        type: "COMMONLY_AVAILABLE_UTILITY",
        requiresConcentration: false,
        sourceBook: "Player's Handbook"
      },
      {
        name: "Attack of Opportunity",
        description: "When a hostile creature that you can see moves out of your reach, you can use your reaction to make one melee attack against that creature.",
        actionCost: "Reaction",
        type: "REACTION",
        requiresConcentration: false,
        sourceBook: "Player's Handbook"
      },
      {
        name: "Second Wind",
        description: "On your turn, you can use a bonus action to regain hit points equal to 1d10 + your fighter level.",
        actionCost: "Bonus Action",
        type: "CLASS_FEATURE",
        requiresConcentration: false,
        sourceBook: "Player's Handbook",
        className: "Fighter",
        usesPer: "Short Rest",
        maxUses: 1
      },
      {
        name: "Action Surge",
        description: "On your turn, you can take one additional action on top of your regular action and a possible bonus action.",
        actionCost: "Special",
        type: "CLASS_FEATURE",
        requiresConcentration: false,
        sourceBook: "Player's Handbook",
        className: "Fighter",
        usesPer: "Short Rest",
        maxUses: 1
      },
      {
        name: "Rage",
        description: "On your turn, you can enter a rage as a bonus action.",
        actionCost: "Bonus Action",
        type: "CLASS_FEATURE",
        requiresConcentration: false,
        sourceBook: "Player's Handbook",
        className: "Barbarian",
        usesPer: "Long Rest",
        maxUses: "Varies by level"
      },
      {
        name: "Unarmored Defense (Barbarian)",
        description: "While you are not wearing any armor, your Armor Class equals 10 + your Dexterity modifier + your Constitution modifier. You can use a shield and still gain this benefit.",
        actionCost: "No Action",
        type: "CLASS_FEATURE",
        requiresConcentration: false,
        sourceBook: "Player's Handbook",
        className: "Barbarian"
      },
      {
        name: "Wild Shape",
        description: "As an action, you can magically assume the shape of a beast that you have seen before.",
        actionCost: "Action",
        type: "CLASS_FEATURE",
        requiresConcentration: false,
        sourceBook: "Player's Handbook",
        className: "Druid",
        usesPer: "Short Rest",
        maxUses: 2
      },
      {
        name: "Bardic Inspiration",
        description: "As a bonus action, you can expend one use of your Bardic Inspiration to choose one creature other than yourself within 60 feet of you who can hear you. That creature gains one Bardic Inspiration die, a d6.",
        actionCost: "Bonus Action",
        type: "CLASS_FEATURE",
        requiresConcentration: false,
        sourceBook: "Player's Handbook",
        className: "Bard",
        usesPer: "Short Rest",
        maxUses: "Charisma modifier"
      },
      {
        name: "Channel Divinity: Turn Undead",
        description: "As an action, you present your holy symbol and speak a prayer censuring the undead. Each undead that can see or hear you within 30 feet of you must make a Wisdom saving throw. If the creature fails its saving throw, it is turned for 1 minute or until it takes any damage.",
        actionCost: "Action",
        type: "CLASS_FEATURE",
        requiresConcentration: false,
        sourceBook: "Player's Handbook",
        className: "Cleric",
        usesPer: "Short Rest",
        maxUses: 1,
        savingThrow: {
          ability: "Wisdom",
          onSave: "Creature is not turned"
        }
      },
      {
        name: "Sneak Attack",
        description: "If you are hidden from a creature and hit it with an attack with a finesse or ranged weapon, you can deal extra damage to the target.",
        actionCost: "No Action",
        type: "CLASS_FEATURE",
        requiresConcentration: false,
        sourceBook: "Player's Handbook",
        className: "Rogue",
        damageRolls: [
          {
            dice: {
              count: 1,
              type: "D6"
            },
            modifier: 0,
            damageType: "PIERCING"
          }
        ]
      },
      {
        name: "Cunning Action",
        description: "As a bonus action, you can take the Dash, Disengage, or Hide action.",
        actionCost: "Bonus Action",
        type: "CLASS_FEATURE",
        requiresConcentration: false,
        sourceBook: "Player's Handbook",
        className: "Rogue"
      },
      {
        name: "Ki: Flurry of Blows",
        description: "Immediately after you take the Attack action on your turn, you can spend 1 ki point to make two unarmed strikes as a bonus action.",
        actionCost: "Bonus Action",
        type: "CLASS_FEATURE",
        requiresConcentration: false,
        sourceBook: "Player's Handbook",
        className: "Monk"
      },
      {
        name: "Lay on Hands",
        description: "As an action, you can touch a creature and draw power from your pool to restore a number of hit points to that creature, up to the maximum amount remaining in your pool.",
        actionCost: "Action",
        type: "CLASS_FEATURE",
        requiresConcentration: false,
        sourceBook: "Player's Handbook",
        className: "Paladin",
        usesPer: "Long Rest",
        maxUses: "Paladin level x 5"
      },
      {
        name: "Hunter's Mark",
        description: "You choose one creature you can see within 90 feet of you and mystically mark it as your quarry. Until the spell ends, you deal an extra 1d6 damage to the target whenever you hit it with a weapon attack, and you have advantage on any Wisdom (Perception) or Wisdom (Survival) check you make to find it. If the target drops to 0 hit points before this spell ends, you can use a bonus action on a subsequent turn of yours to mark a new creature.",
        actionCost: "Bonus Action",
        type: "SPELL",
        requiresConcentration: true,
        sourceBook: "Player's Handbook",
        className: "Ranger",
        spellLevel: 1,
        castingTime: "1 Bonus Action",
        range: "90 feet",
        components: {
          verbal: true,
          somatic: true,
          material: undefined
        },
        duration: "Up to 1 hour",
        damageRolls: [
          {
            dice: {
              count: 1,
              type: "D6"
            },
            modifier: 0,
            damageType: "PIERCING"
          }
        ],
        spellEffectDescription: "Extra 1d6 damage on weapon attacks, advantage on Perception/Survival to track."
      },
      {
        name: "Sorcery Points: Flexible Casting",
        description: "As a bonus action on your turn, you can expend one or more sorcery points to gain a spell slot, or sacrifice a spell slot to gain sorcery points.",
        actionCost: "Bonus Action",
        type: "CLASS_FEATURE",
        requiresConcentration: false,
        sourceBook: "Player's Handbook",
        className: "Sorcerer"
      },
      {
        name: "Dark One's Blessing",
        description: "When you reduce a hostile creature to 0 hit points, you gain temporary hit points equal to your Charisma modifier + your warlock level.",
        actionCost: "No Action",
        type: "CLASS_FEATURE",
        requiresConcentration: false,
        sourceBook: "Player's Handbook",
        className: "Warlock"
      },
      {
        name: "Arcane Recovery",
        description: "Once per day when you finish a short rest, you can choose expended spell slots to recover. The spell slots can have a combined level that is equal to or less than half your wizard level (rounded up), and none of the slots can be 6th level or higher.",
        actionCost: "No Action",
        type: "CLASS_FEATURE",
        requiresConcentration: false,
        sourceBook: "Player's Handbook",
        className: "Wizard",
        usesPer: "Day",
        maxUses: 1
      }
    ];

    // Insert all sample actions
    const createdIds = [];
    for (const action of sampleActions) {
      const id = await ctx.db.insert("actions", {
        ...action,
        userId: user._id,
        createdAt: Date.now(),
      });
      createdIds.push(id);
    }

    return { count: createdIds.length, actionIds: createdIds };
  },
}); 