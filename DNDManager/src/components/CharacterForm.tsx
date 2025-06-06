import React, { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { CharacterFormData, PlayerCharacter, CLASSES, RACES } from "../types/character";
import "./CharacterForm.css";

interface CharacterFormProps {
  onSuccess?: () => void;
}

const CharacterForm: React.FC<CharacterFormProps> = ({ onSuccess }) => {
  const createCharacter = useMutation(api.characters.createPlayerCharacter);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<CharacterFormData>({
    name: "",
    class: "",
    race: "",
    background: "",
    alignment: "",
    abilityScores: {
      strength: 10,
      dexterity: 10,
      constitution: 10,
      intelligence: 10,
      wisdom: 10,
      charisma: 10,
    },
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
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

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setError("Character name is required");
      return false;
    }
    if (!formData.class) {
      setError("Character class is required");
      return false;
    }
    if (!formData.race) {
      setError("Character race is required");
      return false;
    }
    if (!formData.background) {
      setError("Character background is required");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const characterData = {
        name: formData.name.trim(),
        race: formData.race,
        class: formData.class,
        background: formData.background,
        alignment: formData.alignment || undefined,
        abilityScores: formData.abilityScores,
        skills: [], // Will be populated based on class and background
        savingThrows: [], // Will be populated based on class
        proficiencies: [], // Will be populated based on race/class
        level: 1,
        hitPoints: 8, // Base HP, will be calculated based on class and constitution
        armorClass: 10, // Base AC, will be calculated based on dexterity
        proficiencyBonus: 2, // Base proficiency bonus for level 1
      };

      console.log("Creating character with data:", characterData); // Debug log
      const result = await createCharacter(characterData);
      console.log("Character created successfully:", result); // Debug log
      onSuccess?.();
    } catch (err) {
      console.error("Error creating character:", err); // Debug log
      setError(err instanceof Error ? err.message : "Failed to create character");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="character-form">
      <h2>Create New Character</h2>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Character Name *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="race">Race *</label>
          <select
            id="race"
            name="race"
            value={formData.race}
            onChange={handleInputChange}
            required
          >
            <option value="">Select Race</option>
            {RACES.map((race: string) => (
              <option key={race} value={race}>
                {race}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="class">Class *</label>
          <select
            id="class"
            name="class"
            value={formData.class}
            onChange={handleInputChange}
            required
          >
            <option value="">Select Class</option>
            {CLASSES.map((cls: string) => (
              <option key={cls} value={cls}>
                {cls}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="background">Background *</label>
          <input
            type="text"
            id="background"
            name="background"
            value={formData.background}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="alignment">Alignment</label>
          <input
            type="text"
            id="alignment"
            name="alignment"
            value={formData.alignment}
            onChange={handleInputChange}
          />
        </div>

        <div className="ability-scores">
          <h3>Ability Scores</h3>
          {Object.entries(formData.abilityScores).map(([ability, score]) => (
            <div key={ability} className="ability-score">
              <label htmlFor={ability}>{ability}</label>
              <input
                type="number"
                id={ability}
                value={score}
                onChange={(e) =>
                  handleAbilityScoreChange(ability, parseInt(e.target.value) || 10)
                }
                min="1"
                max="20"
              />
            </div>
          ))}
        </div>

        <button type="submit" disabled={isLoading}>
          {isLoading ? "Creating..." : "Create Character"}
        </button>
      </form>
    </div>
  );
};

export default CharacterForm;
