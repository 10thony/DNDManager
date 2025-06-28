declare module "*.json" {
  const value: any;
  export default value;
}

export interface MonsterData {
  campaignId: string | null;
  name: string;
  source: string | null;
  page: string | null;
  size: "Tiny" | "Small" | "Medium" | "Large" | "Huge" | "Gargantuan";
  type: string;
  tags: string[] | null;
  alignment: string;
  armorClass: number;
  armorType: string | null;
  hitPoints: number;
  hitDice: {
    count: number;
    die: "d4" | "d6" | "d8" | "d10" | "d12";
  };
  proficiencyBonus: number;
  speed: {
    walk?: string;
    swim?: string;
    fly?: string;
    burrow?: string;
    climb?: string;
  };
  abilityScores: {
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
  };
  savingThrows: string[] | null;
  skills: string[] | null;
  damageVulnerabilities: string[] | null;
  damageResistances: string[] | null;
  damageImmunities: string[] | null;
  conditionImmunities: string[] | null;
  senses: {
    darkvision?: string;
    blindsight?: string;
    tremorsense?: string;
    truesight?: string;
    passivePerception: number;
  };
  languages: string | null;
  challengeRating: string;
  experiencePoints: number | null;
  traits: Array<{
    name: string;
    description: string;
  }> | null;
  actions: Array<{
    name: string;
    description: string;
  }> | null;
  reactions: Array<{
    name: string;
    description: string;
  }> | null;
  legendaryActions: Array<{
    name: string;
    description: string;
  }> | null;
  lairActions: Array<{
    name: string;
    description: string;
  }> | null;
  regionalEffects: Array<{
    name: string;
    description: string;
  }> | null;
  environment: string[] | null;
  createdAt: number;
  updatedAt: number | null;
} 