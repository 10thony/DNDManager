export type ItemType =
  | "Weapon"
  | "Armor"
  | "Potion"
  | "Scroll"
  | "Wondrous Item"
  | "Ring"
  | "Rod"
  | "Staff"
  | "Wand"
  | "Ammunition"
  | "Adventuring Gear"
  | "Tool"
  | "Mount"
  | "Vehicle"
  | "Treasure"
  | "Other";

export type ItemRarity =
  | "Common"
  | "Uncommon"
  | "Rare"
  | "Very Rare"
  | "Legendary"
  | "Artifact"
  | "Unique";

export interface Item {
  _id?: string; // Convex document ID
  _creationTime?: number; // Convex creation time
  name: string;
  type: ItemType;
  rarity: ItemRarity;
  description: string;
  effects?: string; // Optional effects/rules text
  weight?: number; // Optional weight
  cost?: number; // Optional cost (in copper pieces)
  attunement?: boolean; // Optional: requires attunement
  // Add other relevant fields as needed (e.g., damage dice for weapons, AC for armor)
}
