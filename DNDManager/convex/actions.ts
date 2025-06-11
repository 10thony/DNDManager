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
  args: {},
  handler: async (ctx) => {
    // Insert common actions
    for (const action of commonActions) {
      await ctx.db.insert("actions", {
        ...action,
        createdAt: Date.now(),
      });
    }

    // Insert class-specific actions
    for (const [className, actions] of Object.entries(classActions)) {
      for (const action of actions) {
        await ctx.db.insert("actions", {
          ...action,
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
    actionCost: v.string(),
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
    actionCost: v.string(),
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
    const action = {
      ...args,
      createdAt: Date.now(),
    };
    return await ctx.db.insert("actions", action);
  },
}); 