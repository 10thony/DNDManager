import React, { useState } from "react";
import { useMutation } from "convex/react";
import { useUser } from "@clerk/clerk-react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import "./NPCCreationModal.css";

interface NPCCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (npcId: Id<"npcs">) => void;
}

interface NPCFormData {
  name: string;
  race: string;
  class: string;
  background: string;
  alignment: string;
  level: number;
  hitPoints: number;
  armorClass: number;
  proficiencyBonus: number;
  abilityScores: {
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
  };
  skills: string[];
  savingThrows: string[];
  proficiencies: string[];
  traits: string[];
  languages: string[];
  equipment: string[];
  description: string;
}

const NPCCreationModal: React.FC<NPCCreationModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { user } = useUser();
  const createNPC = useMutation(api.npcs.createNpc);
  
  const [formData, setFormData] = useState<NPCFormData>({
    name: "",
    race: "",
    class: "",
    background: "",
    alignment: "",
    level: 1,
    hitPoints: 10,
    armorClass: 10,
    proficiencyBonus: 2,
    abilityScores: {
      strength: 10,
      dexterity: 10,
      constitution: 10,
      intelligence: 10,
      wisdom: 10,
      charisma: 10,
    },
    skills: [],
    savingThrows: [],
    proficiencies: [],
    traits: [],
    languages: [],
    equipment: [],
    description: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleAbilityScoreChange = (ability: string, value: number) => {
    setFormData((prev) => ({
      ...prev,
      abilityScores: {
        ...prev.abilityScores,
        [ability]: value,
      },
    }));
  };

  const handleArrayChange = (field: keyof NPCFormData, value: string) => {
    // const currentArray = formData[field] as string[];
    const newArray = value.split(',').map(item => item.trim()).filter(item => item);
    setFormData((prev) => ({
      ...prev,
      [field]: newArray,
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "NPC name is required";
    }

    if (!formData.race.trim()) {
      newErrors.race = "Race is required";
    }

    if (!formData.class.trim()) {
      newErrors.class = "Class is required";
    }

    if (!formData.background.trim()) {
      newErrors.background = "Background is required";
    }

    if (formData.level < 1) {
      newErrors.level = "Level must be at least 1";
    }

    if (formData.hitPoints < 1) {
      newErrors.hitPoints = "Hit points must be at least 1";
    }

    if (formData.armorClass < 1) {
      newErrors.armorClass = "Armor class must be at least 1";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !user) {
      return;
    }

    setIsSubmitting(true);

    try {
      const npcData = {
        name: formData.name.trim(),
        race: formData.race.trim(),
        class: formData.class.trim(),
        background: formData.background.trim(),
        alignment: formData.alignment.trim(),
        characterType: "NonPlayerCharacter" as const,
        level: formData.level,
        experiencePoints: 0,
        hitPoints: formData.hitPoints,
        armorClass: formData.armorClass,
        proficiencyBonus: formData.proficiencyBonus,
        abilityScores: formData.abilityScores,
        skills: formData.skills,
        savingThrows: formData.savingThrows,
        proficiencies: formData.proficiencies,
        traits: formData.traits,
        languages: formData.languages,
        equipment: formData.equipment,
        actions: [] as Id<"actions">[],
      };

      const npcId = await createNPC({
        ...npcData,
        clerkId: user!.id,
      });
      onSuccess(npcId);
      handleClose();
    } catch (error) {
      console.error("Error creating NPC:", error);
      setErrors({ submit: "Failed to create NPC. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: "",
      race: "",
      class: "",
      background: "",
      alignment: "",
      level: 1,
      hitPoints: 10,
      armorClass: 10,
      proficiencyBonus: 2,
      abilityScores: {
        strength: 10,
        dexterity: 10,
        constitution: 10,
        intelligence: 10,
        wisdom: 10,
        charisma: 10,
      },
      skills: [],
      savingThrows: [],
      proficiencies: [],
      traits: [],
      languages: [],
      equipment: [],
      description: "",
    });
    setErrors({});
    setIsSubmitting(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="npc-creation-modal">
        <div className="modal-header">
          <h2>Create New NPC</h2>
          <button className="close-button" onClick={handleClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-content">
          <div className="form-section">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">NPC Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={errors.name ? "error" : ""}
                  placeholder="Enter NPC name"
                />
                {errors.name && <span className="error-message">{errors.name}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="race">Race *</label>
                <input
                  type="text"
                  id="race"
                  name="race"
                  value={formData.race}
                  onChange={handleInputChange}
                  className={errors.race ? "error" : ""}
                  placeholder="e.g., Human, Elf, Dwarf"
                />
                {errors.race && <span className="error-message">{errors.race}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="class">Class *</label>
                <input
                  type="text"
                  id="class"
                  name="class"
                  value={formData.class}
                  onChange={handleInputChange}
                  className={errors.class ? "error" : ""}
                  placeholder="e.g., Fighter, Wizard, Rogue"
                />
                {errors.class && <span className="error-message">{errors.class}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="background">Background *</label>
                <input
                  type="text"
                  id="background"
                  name="background"
                  value={formData.background}
                  onChange={handleInputChange}
                  className={errors.background ? "error" : ""}
                  placeholder="e.g., Soldier, Sage, Criminal"
                />
                {errors.background && <span className="error-message">{errors.background}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="alignment">Alignment</label>
                <select
                  id="alignment"
                  name="alignment"
                  value={formData.alignment}
                  onChange={handleInputChange}
                >
                  <option value="">Select alignment</option>
                  <option value="Lawful Good">Lawful Good</option>
                  <option value="Neutral Good">Neutral Good</option>
                  <option value="Chaotic Good">Chaotic Good</option>
                  <option value="Lawful Neutral">Lawful Neutral</option>
                  <option value="True Neutral">True Neutral</option>
                  <option value="Chaotic Neutral">Chaotic Neutral</option>
                  <option value="Lawful Evil">Lawful Evil</option>
                  <option value="Neutral Evil">Neutral Evil</option>
                  <option value="Chaotic Evil">Chaotic Evil</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="level">Level</label>
                <input
                  type="number"
                  id="level"
                  name="level"
                  value={formData.level}
                  onChange={handleInputChange}
                  className={errors.level ? "error" : ""}
                  min="1"
                  max="20"
                />
                {errors.level && <span className="error-message">{errors.level}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="hitPoints">Hit Points</label>
                <input
                  type="number"
                  id="hitPoints"
                  name="hitPoints"
                  value={formData.hitPoints}
                  onChange={handleInputChange}
                  className={errors.hitPoints ? "error" : ""}
                  min="1"
                />
                {errors.hitPoints && <span className="error-message">{errors.hitPoints}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="armorClass">Armor Class</label>
                <input
                  type="number"
                  id="armorClass"
                  name="armorClass"
                  value={formData.armorClass}
                  onChange={handleInputChange}
                  className={errors.armorClass ? "error" : ""}
                  min="1"
                />
                {errors.armorClass && <span className="error-message">{errors.armorClass}</span>}
              </div>
            </div>

            <div className="form-section-title">Ability Scores</div>
            <div className="ability-scores-grid">
              {Object.entries(formData.abilityScores).map(([ability, score]) => (
                <div key={ability} className="ability-score-group">
                  <label htmlFor={ability}>{ability.charAt(0).toUpperCase() + ability.slice(1)}</label>
                  <input
                    type="number"
                    id={ability}
                    value={score}
                    onChange={(e) => handleAbilityScoreChange(ability, parseInt(e.target.value) || 10)}
                    min="1"
                    max="20"
                  />
                </div>
              ))}
            </div>

            <div className="form-section-title">Additional Information</div>
            
            <div className="form-group">
              <label htmlFor="skills">Skills (comma-separated)</label>
              <input
                type="text"
                id="skills"
                value={formData.skills.join(', ')}
                onChange={(e) => handleArrayChange('skills', e.target.value)}
                placeholder="e.g., Athletics, Stealth, Persuasion"
              />
            </div>

            <div className="form-group">
              <label htmlFor="savingThrows">Saving Throws (comma-separated)</label>
              <input
                type="text"
                id="savingThrows"
                value={formData.savingThrows.join(', ')}
                onChange={(e) => handleArrayChange('savingThrows', e.target.value)}
                placeholder="e.g., Strength, Dexterity"
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe the NPC's appearance, personality, and background..."
                rows={4}
              />
            </div>
          </div>

          {errors.submit && (
            <div className="error-message global-error">{errors.submit}</div>
          )}
        </form>

        <div className="modal-footer">
          <button className="cancel-button" onClick={handleClose}>
            Cancel
          </button>
          <button
            type="submit"
            className="confirm-button"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating..." : "Create NPC"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NPCCreationModal; 