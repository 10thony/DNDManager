import React, { useState } from "react";
import { useMutation } from "convex/react";
import { useUser } from "@clerk/clerk-react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import Modal from "../Modal";
import "./MonsterCreationModal.css";

interface MonsterCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (monsterId: Id<"monsters">) => void;
  campaignId?: Id<"campaigns">;
}

interface MonsterFormData {
  [key: string]: any;
  name: string;
  source: string;
  page: string;
  size: string;
  type: string;
  tags: string[];
  alignment: string;
  armorClass: number;
  armorType: string;
  hitPoints: number;
  hitDice: { count: number; die: string };
  proficiencyBonus: number;
  abilityScores: {
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
  };
  speed: {
    walk: string;
    swim: string;
    fly: string;
    burrow: string;
    climb: string;
  };
  savingThrows: string[];
  skills: string[];
  damageVulnerabilities: string[];
  damageResistances: string[];
  damageImmunities: string[];
  conditionImmunities: string[];
  senses: {
    darkvision: string;
    blindsight: string;
    tremorsense: string;
    truesight: string;
    passivePerception: number;
  };
  languages: string;
  challengeRating: string;
  experiencePoints: number;
  traits: Array<{ name: string; description: string }>;
  actions: Array<{ name: string; description: string }>;
  reactions: Array<{ name: string; description: string }>;
  legendaryActions: Array<{ name: string; description: string }>;
  lairActions: Array<{ name: string; description: string }>;
  regionalEffects: Array<{ name: string; description: string }>;
  environment: string[];
}

const MonsterCreationModal: React.FC<MonsterCreationModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  campaignId,
}) => {
  const { user } = useUser();
  const createMonster = useMutation(api.monsters.createMonster);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<MonsterFormData>({
    name: "",
    source: "",
    page: "",
    size: "Medium" as const,
    type: "",
    tags: [] as string[],
    alignment: "Unaligned",
    armorClass: 10,
    armorType: "",
    hitPoints: 10,
    hitDice: {
      count: 1,
      die: "d8" as const,
    },
    proficiencyBonus: 2,
    speed: {
      walk: "30 ft.",
      swim: "",
      fly: "",
      burrow: "",
      climb: "",
    },
    abilityScores: {
      strength: 10,
      dexterity: 10,
      constitution: 10,
      intelligence: 10,
      wisdom: 10,
      charisma: 10,
    },
    savingThrows: [] as string[],
    skills: [] as string[],
    damageVulnerabilities: [] as string[],
    damageResistances: [] as string[],
    damageImmunities: [] as string[],
    conditionImmunities: [] as string[],
    senses: {
      darkvision: "",
      blindsight: "",
      tremorsense: "",
      truesight: "",
      passivePerception: 10,
    },
    languages: "",
    challengeRating: "1/4",
    experiencePoints: 50,
    traits: [] as Array<{ name: string; description: string }>,
    actions: [] as Array<{ name: string; description: string }>,
    reactions: [] as Array<{ name: string; description: string }>,
    legendaryActions: [] as Array<{ name: string; description: string }>,
    lairActions: [] as Array<{ name: string; description: string }>,
    regionalEffects: [] as Array<{ name: string; description: string }>,
    environment: [] as string[],
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNestedInputChange = (parentField: string, childField: string, value: any) => {
    setFormData(prev => {
      const parentValue = prev[parentField];
      const parentObj = (typeof parentValue === 'object' && parentValue !== null) ? parentValue : {};
      return {
        ...prev,
        [parentField]: {
          ...parentObj,
          [childField]: value,
        },
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaignId) {
      alert("Campaign ID is required to create a monster.");
      return;
    }

    setIsSubmitting(true);
    try {
      const monsterId = await createMonster({
        campaignId,
        ...formData,
        size: formData.size as "Tiny" | "Small" | "Medium" | "Large" | "Huge" | "Gargantuan",
        hitDice: {
          count: formData.hitDice.count,
          die: formData.hitDice.die as "d4" | "d6" | "d8" | "d10" | "d12"
        },
        abilityScores: formData.abilityScores,
        proficiencyBonus: formData.proficiencyBonus,
        clerkId: user!.id,
      });
      onSuccess(monsterId);
    } catch (error) {
      console.error("Error creating monster:", error);
      alert("Failed to create monster. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const sizeOptions = ["Tiny", "Small", "Medium", "Large", "Huge", "Gargantuan"];
  const dieOptions = ["d4", "d6", "d8", "d10", "d12"];
  const alignmentOptions = [
    "Lawful Good", "Neutral Good", "Chaotic Good",
    "Lawful Neutral", "Neutral", "Chaotic Neutral",
    "Lawful Evil", "Neutral Evil", "Chaotic Evil",
    "Unaligned"
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Monster">
      <form onSubmit={handleSubmit} className="monster-creation-form">
        <div className="form-section">
          <h3>Basic Information</h3>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">Name *</label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="size">Size</label>
              <select
                id="size"
                value={formData.size}
                onChange={(e) => handleInputChange("size", e.target.value)}
              >
                {sizeOptions.map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="type">Type</label>
              <input
                type="text"
                id="type"
                value={formData.type}
                onChange={(e) => handleInputChange("type", e.target.value)}
                placeholder="e.g., Humanoid, Beast, Dragon"
              />
            </div>
            <div className="form-group">
              <label htmlFor="alignment">Alignment</label>
              <select
                id="alignment"
                value={formData.alignment}
                onChange={(e) => handleInputChange("alignment", e.target.value)}
              >
                {alignmentOptions.map(alignment => (
                  <option key={alignment} value={alignment}>{alignment}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="source">Source</label>
              <input
                type="text"
                id="source"
                value={formData.source}
                onChange={(e) => handleInputChange("source", e.target.value)}
                placeholder="e.g., Monster Manual"
              />
            </div>
            <div className="form-group">
              <label htmlFor="page">Page</label>
              <input
                type="text"
                id="page"
                value={formData.page}
                onChange={(e) => handleInputChange("page", e.target.value)}
                placeholder="e.g., 25"
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Combat Statistics</h3>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="armorClass">Armor Class</label>
              <input
                type="number"
                id="armorClass"
                value={formData.armorClass}
                onChange={(e) => handleInputChange("armorClass", parseInt(e.target.value))}
                min="0"
              />
            </div>
            <div className="form-group">
              <label htmlFor="armorType">Armor Type</label>
              <input
                type="text"
                id="armorType"
                value={formData.armorType}
                onChange={(e) => handleInputChange("armorType", e.target.value)}
                placeholder="e.g., natural armor"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="hitPoints">Hit Points</label>
              <input
                type="number"
                id="hitPoints"
                value={formData.hitPoints}
                onChange={(e) => handleInputChange("hitPoints", parseInt(e.target.value))}
                min="1"
              />
            </div>
            <div className="form-group">
              <label htmlFor="hitDiceCount">Hit Dice Count</label>
              <input
                type="number"
                id="hitDiceCount"
                value={formData.hitDice.count}
                onChange={(e) => handleNestedInputChange("hitDice", "count", parseInt(e.target.value))}
                min="1"
              />
            </div>
            <div className="form-group">
              <label htmlFor="hitDiceDie">Hit Dice Type</label>
              <select
                id="hitDiceDie"
                value={formData.hitDice.die}
                onChange={(e) => handleNestedInputChange("hitDice", "die", e.target.value)}
              >
                {dieOptions.map(die => (
                  <option key={die} value={die}>{die}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="challengeRating">Challenge Rating</label>
              <input
                type="text"
                id="challengeRating"
                value={formData.challengeRating}
                onChange={(e) => handleInputChange("challengeRating", e.target.value)}
                placeholder="e.g., 1/4, 1, 5"
              />
            </div>
            <div className="form-group">
              <label htmlFor="experiencePoints">Experience Points</label>
              <input
                type="number"
                id="experiencePoints"
                value={formData.experiencePoints}
                onChange={(e) => handleInputChange("experiencePoints", parseInt(e.target.value))}
                min="0"
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Ability Scores</h3>
          <div className="ability-scores-grid">
            {Object.entries(formData.abilityScores).map(([ability, score]) => (
              <div key={ability} className="form-group">
                <label htmlFor={ability}>{ability.charAt(0).toUpperCase() + ability.slice(1)}</label>
                <input
                  type="number"
                  id={ability}
                  value={score as number}
                  onChange={(e) => handleNestedInputChange("abilityScores", ability, parseInt(e.target.value))}
                  min="1"
                  max="30"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="form-section">
          <h3>Speed</h3>
          <div className="speed-grid">
            {Object.entries(formData.speed).map(([type, value]) => (
              <div key={type} className="form-group">
                <label htmlFor={`speed-${type}`}>{type.charAt(0).toUpperCase() + type.slice(1)}</label>
                <input
                  type="text"
                  id={`speed-${type}`}
                  value={value}
                  onChange={(e) => handleNestedInputChange("speed", type, e.target.value)}
                  placeholder={type === "walk" ? "30 ft." : ""}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="form-section">
          <h3>Senses</h3>
          <div className="senses-grid">
            <div className="form-group">
              <label htmlFor="passivePerception">Passive Perception</label>
              <input
                type="number"
                id="passivePerception"
                value={formData.senses.passivePerception}
                onChange={(e) => handleNestedInputChange("senses", "passivePerception", parseInt(e.target.value))}
                min="0"
              />
            </div>
            {Object.entries(formData.senses).filter(([key]) => key !== "passivePerception").map(([sense, value]) => (
              <div key={sense} className="form-group">
                <label htmlFor={`sense-${sense}`}>{sense.charAt(0).toUpperCase() + sense.slice(1)}</label>
                <input
                  type="text"
                  id={`sense-${sense}`}
                  value={value}
                  onChange={(e) => handleNestedInputChange("senses", sense, e.target.value)}
                  placeholder="e.g., 60 ft."
                />
              </div>
            ))}
          </div>
        </div>

        <div className="form-section">
          <h3>Languages</h3>
          <div className="form-group">
            <label htmlFor="languages">Languages</label>
            <input
              type="text"
              id="languages"
              value={formData.languages}
              onChange={(e) => handleInputChange("languages", e.target.value)}
              placeholder="e.g., Common, Elvish"
            />
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={onClose}
            className="cancel-button"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="submit-button"
            disabled={isSubmitting || !formData.name}
          >
            {isSubmitting ? "Creating..." : "Create Monster"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default MonsterCreationModal; 