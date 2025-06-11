import React, { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { CharacterFormData, PlayerCharacter, CLASSES, RACES } from "../types/character";
import { Id } from "../../convex/_generated/dataModel";
import "./CharacterForm.css";

interface CharacterFormProps {
  onSuccess?: () => void;
}

const CharacterForm: React.FC<CharacterFormProps> = ({ onSuccess }) => {
  const createCharacter = useMutation(api.characters.createPlayerCharacter);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedActions, setSelectedActions] = useState<Id<"actions">[]>([]);

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

  // Get available actions based on class
  const availableActions = useQuery(api.actions.getActionsByClass, {
    className: formData.class || "",
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

  const handleActionToggle = (actionId: Id<"actions">) => {
    setSelectedActions((prev) => {
      if (prev.includes(actionId)) {
        return prev.filter(id => id !== actionId);
      } else {
        return [...prev, actionId];
      }
    });
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
    if (selectedActions.length === 0) {
      setError("At least one action must be selected");
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
      // Ensure we have at least one action selected
      if (selectedActions.length === 0) {
        setError("At least one action must be selected");
        setIsLoading(false);
        return;
      }

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
        actions: selectedActions, // This is now guaranteed to have at least one action
        equipment: [], // Optional field
        languages: [], // Optional field
        traits: [], // Optional field
      };

      console.log("Creating character with data:", characterData);
      const result = await createCharacter(characterData);
      console.log("Character created successfully:", result);
      onSuccess?.();
    } catch (err) {
      console.error("Error creating character:", err);
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

        {formData.class && (
          <div className="actions-section">
            <h3>Available Actions</h3>
            <div className="actions-grid">
              {availableActions?.map((action) => (
                <div key={action._id} className="action-card">
                  <label className="action-label">
                    <input
                      type="checkbox"
                      checked={selectedActions.includes(action._id)}
                      onChange={() => handleActionToggle(action._id)}
                    />
                    <div className="action-content">
                      <h4>{action.name}</h4>
                      <p>{action.description}</p>
                      <div className="action-meta">
                        <span className="action-type">{action.type}</span>
                        <span className="action-cost">{action.actionCost}</span>
                      </div>
                    </div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        <button type="submit" disabled={isLoading}>
          {isLoading ? "Creating..." : "Create Character"}
        </button>
      </form>
    </div>
  );
};

export default CharacterForm;
