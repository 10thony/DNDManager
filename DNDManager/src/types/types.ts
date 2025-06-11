/**
 * Core Enums for D&D 5e Concepts
 */

export enum AbilityScore {
    Strength = 'STR',
    Dexterity = 'DEX',
    Constitution = 'CON',
    Intelligence = 'INT',
    Wisdom = 'WIS',
    Charisma = 'CHA',
  }
  
  export enum ActionType {
    MeleeAttack = 'MELEE_ATTACK',
    RangedAttack = 'RANGED_ATTACK',
    Spell = 'SPELL',
    Utility = 'COMMONLY_AVAILABLE_UTILITY', // Like Dash, Disengage, Dodge
    ClassFeature = 'CLASS_FEATURE', // For class-specific abilities that aren't attacks/spells
    BonusAction = 'BONUS_ACTION',
    Reaction = 'REACTION',
    Other = 'OTHER', // For anything that doesn't fit neatly
  }
  
  export enum DamageType {
    Bludgeoning = 'BLUDGEONING',
    Piercing = 'PIERCING',
    Slashing = 'SLASHING',
    Acid = 'ACID',
    Cold = 'COLD',
    Fire = 'FIRE',
    Force = 'FORCE',
    Lightning = 'LIGHTNING',
    Necrotic = 'NECROTIC',
    Poison = 'POISON',
    Psychic = 'PSYCHIC',
    Radiant = 'RADIANT',
    Thunder = 'THUNDER',
  }
  
  export enum AttackRollModifier {
    Proficiency = 'PROFICIENCY',
    AbilityModifier = 'ABILITY_MODIFIER',
    Other = 'OTHER',
  }
  
  export enum DamageDiceType {
    D4 = 'D4',
    D6 = 'D6',
    D8 = 'D8',
    D10 = 'D10',
    D12 = 'D12',
    D20 = 'D20',
  }
  
  /**
   * Base Action Interface
   */
  
  export interface BaseAction {
    id: string; // Unique identifier for the action
    name: string;
    description: string;
    actionCost: 'Action' | 'Bonus Action' | 'Reaction' | 'No Action' | 'Special';
    requiresConcentration?: boolean;
    // Potentially add more common properties here like 'range', 'duration', etc.
    // This is a good place to add properties relevant to a UI for display
    iconUrl?: string; // For a UI
    sourceBook?: string; // PHB, DMG, etc.
  }
  
  /**
   * Specific Action Types (Discriminated Union Members)
   */
  
  // --- Attack Actions ---
  export interface DamageRoll {
    dice: {
      count: number;
      type: DamageDiceType;
    };
    modifier: number; // e.g., +2 from magic weapon, or Ability Score modifier
    damageType: DamageType;
  }
  
  export interface AttackAction extends BaseAction {
    type: ActionType.MeleeAttack | ActionType.RangedAttack;
    attackBonusAbilityScore: AbilityScore;
    isProficient: boolean;
    damageRolls: DamageRoll[];
    // Potentially add 'weaponType', 'range', 'properties' (finesse, versatile)
  }
  
  // --- Spell Actions ---
  export interface SpellAction extends BaseAction {
    type: ActionType.Spell;
    spellLevel: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
    castingTime: string; // "1 Action", "1 Bonus Action", "1 Reaction", "1 Minute", etc.
    range: string;
    components: {
      verbal: boolean;
      somatic: boolean;
      material?: string; // "A pinch of sand"
    };
    duration: string; // "Instantaneous", "1 Minute", "Concentration, up to 1 Hour"
    savingThrow?: {
      ability: AbilityScore;
      onSave: 'half damage' | 'no effect' | string; // e.g., "target is not restrained"
    };
    // Detailed spell effect description, possibly a reference to a separate spell entry
    spellEffectDescription: string;
  }
  
  // --- Utility Actions (Dash, Disengage, Dodge) ---
  export interface UtilityAction extends BaseAction {
    type: ActionType.Utility;
    // Specific properties for utility actions, if any
  }
  
  // --- Class Feature Actions (e.g., Rage, Action Surge, Wild Shape) ---
  export interface ClassFeatureAction extends BaseAction {
    type: ActionType.ClassFeature;
    className: string; // e.g., "Barbarian", "Fighter"
    // Specific properties for class features, like number of uses, recharge, etc.
    usesPer?: 'Short Rest' | 'Long Rest' | 'Day' | 'Special';
    maxUses?: number | string; // e.g., number, or "Proficiency Bonus per Long Rest"
  }
  
  // --- Other / Generic Actions (for flexibility) ---
  export interface GenericAction extends BaseAction {
    type: ActionType.Other | ActionType.BonusAction | ActionType.Reaction; // Catch-all
    // Can add any custom properties as needed here
  }
  
  /**
   * Union Type for All Possible Actions
   */
  export type PlayerCharacterAction =
    | AttackAction
    | SpellAction
    | UtilityAction
    | ClassFeatureAction
    | GenericAction;
  
  /**
   * Player Character Action Dictionary (Keyed by Action ID)
   */
  export type PlayerCharacterActionDictionary = {
    [id: string]: PlayerCharacterAction;
  };
  
  /**
   * --- Action Factory Functions ---
   * These functions simplify the creation of new actions and ensure type correctness.
   */
  
  interface AttackActionParams {
    id: string;
    name: string;
    description: string;
    actionCost: 'Action' | 'Bonus Action' | 'Reaction' | 'No Action' | 'Special';
    attackType: ActionType.MeleeAttack | ActionType.RangedAttack;
    attackBonusAbilityScore: AbilityScore;
    isProficient: boolean;
    damageRolls: DamageRoll[];
    requiresConcentration?: boolean;
    iconUrl?: string;
    sourceBook?: string;
  }
  
  export function createAttackAction(params: AttackActionParams): AttackAction {
    return {
      ...params,
      type: params.attackType,
    };
  }
  
  interface SpellActionParams {
    id: string;
    name: string;
    description: string;
    spellLevel: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
    castingTime: string;
    range: string;
    components: {
      verbal: boolean;
      somatic: boolean;
      material?: string;
    };
    duration: string;
    spellEffectDescription: string;
    actionCost?: 'Action' | 'Bonus Action' | 'Reaction' | 'No Action' | 'Special'; // Spells usually dictate cost
    requiresConcentration?: boolean;
    savingThrow?: {
      ability: AbilityScore;
      onSave: 'half damage' | 'no effect' | string;
    };
    iconUrl?: string;
    sourceBook?: string;
  }
  
  export function createSpellAction(params: SpellActionParams): SpellAction {
    return {
      ...params,
      type: ActionType.Spell,
      actionCost: params.actionCost || 'Action', // Most spells are an action
    };
  }
  
  interface UtilityActionParams {
    id: string;
    name: string;
    description: string;
    actionCost: 'Action' | 'Bonus Action' | 'Reaction' | 'No Action' | 'Special';
    requiresConcentration?: boolean;
    iconUrl?: string;
    sourceBook?: string;
  }
  
  export function createUtilityAction(params: UtilityActionParams): UtilityAction {
    return {
      ...params,
      type: ActionType.Utility,
    };
  }
  
  interface ClassFeatureActionParams {
    id: string;
    name: string;
    description: string;
    className: string;
    actionCost: 'Action' | 'Bonus Action' | 'Reaction' | 'No Action' | 'Special';
    usesPer?: 'Short Rest' | 'Long Rest' | 'Day' | 'Special';
    maxUses?: number | string;
    requiresConcentration?: boolean;
    iconUrl?: string;
    sourceBook?: string;
  }
  
  export function createClassFeatureAction(
    params: ClassFeatureActionParams,
  ): ClassFeatureAction {
    return {
      ...params,
      type: ActionType.ClassFeature,
    };
  }
  
  interface GenericActionParams {
    id: string;
    name: string;
    description: string;
    actionCost: 'Action' | 'Bonus Action' | 'Reaction' | 'No Action' | 'Special';
    type: ActionType.Other | ActionType.BonusAction | ActionType.Reaction;
    requiresConcentration?: boolean;
    iconUrl?: string;
    sourceBook?: string;
    // Allow for any extra, unforeseen properties for truly generic actions
    [key: string]: any;
  }
  
  export function createGenericAction(params: GenericActionParams): GenericAction {
    return {
      ...params,
    };
  }
  
  /**
   * --- Action Repositories / Libraries ---
   * A place to store and retrieve actions.
   */
  
  // This could be a simple object, a Map, or a class.
  // For extensibility, a class or a robust service would be better in a real app.
  export const AllAvailableActions: PlayerCharacterActionDictionary = {};
  
  /**
   * Function to add actions to the central repository.
   * This is crucial for managing and sharing actions.
   */
  export function addActionToRepository(action: PlayerCharacterAction) {
    if (AllAvailableActions[action.id]) {
      console.warn(`Action with ID '${action.id}' already exists. Overwriting.`);
    }
    AllAvailableActions[action.id] = action;
  }
  
  /**
   * Function to get an action from the central repository.
   */
  export function getActionFromRepository(
    id: string,
  ): PlayerCharacterAction | undefined {
    return AllAvailableActions[id];
  }