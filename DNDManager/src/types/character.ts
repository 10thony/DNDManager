import type { Doc, Id } from "../../convex/_generated/dataModel";

export type PlayerCharacter = Doc<"characters">;

export interface AbilityScores {
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
}

export interface SavingThrows {
  strength: boolean;
  dexterity: boolean;
  constitution: boolean;
  intelligence: boolean;
  wisdom: boolean;
  charisma: boolean;
}

export interface HitPoints {
  current: number;
  maximum: number;
  temporary: number;
}

export interface Spell {
  name: string;
  level: number;
  school: string;
  description: string;
}

export interface CharacterFormData {
  name: string;
  class: string;
  race: string;
  background: string;
  level: number;
  hitPoints: HitPoints;
  armorClass: number;
  speed: number;
  proficiencyBonus: number;
  abilityScores: AbilityScores;
  savingThrows: SavingThrows;
  skills: string[];
  languages: string[];
  equipment: string[];
  spells?: Spell[];
  notes?: string;
}

export const DND_CLASSES = [
  "Artificer",
  "Barbarian",
  "Bard",
  "Cleric",
  "Druid",
  "Fighter",
  "Monk",
  "Paladin",
  "Ranger",
  "Rogue",
  "Sorcerer",
  "Warlock",
  "Wizard",
] as const;

export const DND_RACES = [
  "Dragonborn",
  "Dwarf",
  "Elf",
  "Gnome",
  "Half-Elf",
  "Half-Orc",
  "Halfling",
  "Human",
  "Tiefling",
] as const;

export const DND_BACKGROUNDS = [
  "Acolyte",
  "Criminal",
  "Folk Hero",
  "Noble",
  "Sage",
  "Soldier",
  "Charlatan",
  "Entertainer",
  "Guild Artisan",
  "Hermit",
  "Outlander",
  "Sailor",
] as const;

export const DND_SKILLS = [
  "Acrobatics",
  "Animal Handling",
  "Arcana",
  "Athletics",
  "Deception",
  "History",
  "Insight",
  "Intimidation",
  "Investigation",
  "Medicine",
  "Nature",
  "Perception",
  "Performance",
  "Persuasion",
  "Religion",
  "Sleight of Hand",
  "Stealth",
  "Survival",
] as const;
