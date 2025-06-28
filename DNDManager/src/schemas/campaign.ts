import { Id } from "../../convex/_generated/dataModel";

export interface CampaignSchema {
  _id: Id<"campaigns">;
  name: string;
  creatorId: Id<"users">;
  description?: string;
  worldSetting?: string;
  startDate?: number;
  isPublic: boolean;
  
  participantPlayerCharacterIds?: Id<"playerCharacters">[];
  participantUserIds?: Id<"users">[];
  tags?: Id<"tags">[];
  
  locationIds?: Id<"locations">[];
  questIds?: Id<"quests">[];
  sessionIds?: Id<"sessions">[];
  npcIds?: Id<"npcs">[];
  factionIds?: Id<"factions">[];
  monsterIds?: Id<"monsters">[];
  spellIds?: Id<"spells">[];
  deityIds?: Id<"deities">[];
  journalIds?: Id<"journals">[];
  mediaAssetIds?: Id<"mediaAssets">[];
  storyArcIds?: Id<"storyArcs">[];
  milestoneIds?: Id<"milestones">[];
  timelineEventIds?: Id<"timelineEvents">[];
  
  createdAt: number;
  updatedAt?: number;
}

export interface CampaignValidationState {
  hasName: boolean;
  hasTimelineEvents: boolean;
  hasPlayerCharacters: boolean;
  hasNPCs: boolean;
  hasQuests: boolean;
  hasInteractions: boolean;
  hasLocations: boolean;
  hasBossMonsters: boolean;
}

export interface CampaignCreationRequirements {
  timelineEventsRequired: 3;
  playerCharactersRequired: 1;
  npcsRequired: 1;
  questsRequired: 1;
  interactionsRequired: 1;
  locationsRequired: 1;
  bossMonstersRequired: 1;
} 