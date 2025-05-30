import { AbilityScores } from "./character";

export const getAbilityModifier = (score: number): number => {
  return Math.floor((score - 10) / 2);
};

export const rollAbilityScore = (): number => {
  // Roll 4d6, drop lowest
  const rolls = Array.from({ length: 4 }, () => Math.floor(Math.random() * 6) + 1);
  rolls.sort((a, b) => b - a);
  return rolls.slice(0, 3).reduce((sum, roll) => sum + roll, 0);
};

export const getRacialBonuses = (race: string): Partial<AbilityScores> => {
  const bonuses: Record<string, Partial<AbilityScores>> = {
    Human: {
      strength: 1,
      dexterity: 1,
      constitution: 1,
      intelligence: 1,
      wisdom: 1,
      charisma: 1,
    },
    Elf: { dexterity: 2 },
    Dwarf: { constitution: 2 },
    Halfling: { dexterity: 2 },
    Dragonborn: { strength: 2, charisma: 1 },
    Gnome: { intelligence: 2 },
    "Half-Elf": { charisma: 2 },
    "Half-Orc": { strength: 2, constitution: 1 },
    Tiefling: { intelligence: 1, charisma: 2 },
  };
  return bonuses[race] || {};
};

export const getClassSavingThrows = (characterClass: string): string[] => {
  const savingThrows: Record<string, string[]> = {
    Barbarian: ["Strength", "Constitution"],
    Bard: ["Dexterity", "Charisma"],
    Cleric: ["Wisdom", "Charisma"],
    Druid: ["Intelligence", "Wisdom"],
    Fighter: ["Strength", "Constitution"],
    Monk: ["Strength", "Dexterity"],
    Paladin: ["Wisdom", "Charisma"],
    Ranger: ["Strength", "Dexterity"],
    Rogue: ["Dexterity", "Intelligence"],
    Sorcerer: ["Constitution", "Charisma"],
    Warlock: ["Wisdom", "Charisma"],
    Wizard: ["Intelligence", "Wisdom"],
  };
  return savingThrows[characterClass] || [];
};

export const getClassSkills = (characterClass: string): string[] => {
  const classSkills: Record<string, string[]> = {
    Barbarian: ["Animal Handling", "Athletics", "Intimidation", "Nature"],
    Bard: ["Deception", "History", "Investigation", "Persuasion"],
    Cleric: ["History", "Insight", "Medicine", "Persuasion"],
    Druid: ["Arcana", "Animal Handling", "Insight", "Medicine"],
    Fighter: ["Acrobatics", "Animal Handling", "Athletics", "History"],
    Monk: ["Acrobatics", "Athletics", "History", "Insight"],
    Paladin: ["Athletics", "Insight", "Intimidation", "Medicine"],
    Ranger: ["Animal Handling", "Athletics", "Insight", "Investigation"],
    Rogue: ["Acrobatics", "Athletics", "Deception", "Insight"],
    Sorcerer: ["Arcana", "Deception", "Insight", "Intimidation"],
    Warlock: ["Arcana", "Deception", "History", "Intimidation"],
    Wizard: ["Arcana", "History", "Insight", "Investigation"],
  };
  return classSkills[characterClass] || [];
};

export const getBackgroundSkills = (background: string): string[] => {
  const backgroundSkills: Record<string, string[]> = {
    Acolyte: ["Insight", "Religion"],
    Criminal: ["Deception", "Stealth"],
    "Folk Hero": ["Animal Handling", "Survival"],
    Noble: ["History", "Persuasion"],
    Sage: ["Arcana", "History"],
    Soldier: ["Athletics", "Intimidation"],
    Charlatan: ["Deception", "Sleight of Hand"],
    Entertainer: ["Acrobatics", "Performance"],
    "Guild Artisan": ["Insight", "Persuasion"],
    Hermit: ["Medicine", "Religion"],
    Outlander: ["Athletics", "Survival"],
    Sailor: ["Athletics", "Perception"],
  };
  return backgroundSkills[background] || [];
};

export const calculateHitPoints = (
  characterClass: string,
  constitution: number,
  level: number = 1
): number => {
  const hitDie: Record<string, number> = {
    Barbarian: 12,
    Fighter: 10,
    Paladin: 10,
    Ranger: 10,
    Bard: 8,
    Cleric: 8,
    Druid: 8,
    Monk: 8,
    Rogue: 8,
    Warlock: 8,
    Sorcerer: 6,
    Wizard: 6,
  };

  const baseHitDie = hitDie[characterClass] || 8;
  const constitutionModifier = getAbilityModifier(constitution);

  // At level 1, you get max hit die + con modifier
  return baseHitDie + constitutionModifier;
};

export const calculateArmorClass = (dexterity: number): number => {
  // Base AC (10) + Dex modifier (assuming no armor)
  return 10 + getAbilityModifier(dexterity);
};

export const getProficiencyBonus = (level: number): number => {
  return Math.ceil(level / 4) + 1;
};
