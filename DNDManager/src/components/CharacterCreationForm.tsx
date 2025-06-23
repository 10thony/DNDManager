import React, { useState } from "react";
import { useMutation } from "convex/react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import {
  CharacterFormData,
  AbilityScores,
  RACES,
  CLASSES,
  BACKGROUNDS,
  ALIGNMENTS,
} from "../types/character";
import {
  rollAbilityScore,
  getRacialBonuses,
  getClassSavingThrows,
  getClassSkills,
  getBackgroundSkills,
  calculateHitPoints,
  calculateArmorClass,
  getProficiencyBonus,
  getAbilityModifier,
} from "../types/dndRules";
import "./CharacterCreationForm.css";

const CharacterCreationForm: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const createCharacter = useMutation(api.characters.createPlayerCharacter);

  const [formData, setFormData] = useState<CharacterFormData>({
    name: "",
    race: "",
    class: "",
    background: "",
    alignment: "",
    characterType: "PlayerCharacter",
    abilityScores: {
      strength: 10,
      dexterity: 10,
      constitution: 10,
      intelligence: 10,
      wisdom: 10,
      charisma: 10,
    },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleAbilityScoreChange = (
    ability: keyof AbilityScores,
    value: number
  ) => {
    setFormData((prev) => ({
      ...prev,
      abilityScores: {
        ...prev.abilityScores,
        [ability]: Math.max(1, Math.min(20, value)),
      },
    }));
  };

  const randomizeAbilityScore = (ability: keyof AbilityScores) => {
    const rolledValue = rollAbilityScore();
    handleAbilityScoreChange(ability, rolledValue);
  };

  const randomizeAllAbilityScores = () => {
    const newScores: AbilityScores = {
      strength: rollAbilityScore(),
      dexterity: rollAbilityScore(),
      constitution: rollAbilityScore(),
      intelligence: rollAbilityScore(),
      wisdom: rollAbilityScore(),
      charisma: rollAbilityScore(),
    };
    setFormData((prev) => ({
      ...prev,
      abilityScores: newScores,
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Character name is required";
    }
    if (!formData.race) {
      newErrors.race = "Race selection is required";
    }
    if (!formData.class) {
      newErrors.class = "Class selection is required";
    }
    if (!formData.background) {
      newErrors.background = "Background selection is required";
    }
    if (!formData.characterType) {
      newErrors.characterType = "Character type is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateFinalAbilityScores = (): AbilityScores => {
    const racialBonuses = getRacialBonuses(formData.race);
    const finalScores: AbilityScores = { ...formData.abilityScores };

    Object.entries(racialBonuses).forEach(([ability, bonus]) => {
      if (bonus) {
        finalScores[ability as keyof AbilityScores] += bonus;
      }
    });

    return finalScores;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const finalAbilityScores = calculateFinalAbilityScores();
      const classSkills = getClassSkills(formData.class);
      const backgroundSkills = getBackgroundSkills(formData.background);
      const allSkills = [...new Set([...classSkills, ...backgroundSkills])];

      const characterData = {
        name: formData.name.trim(),
        race: formData.race,
        class: formData.class,
        background: formData.background,
        alignment: formData.alignment || undefined,
        abilityScores: finalAbilityScores,
        skills: allSkills,
        savingThrows: getClassSavingThrows(formData.class),
        proficiencies: [], // Could be expanded based on race/class
        level: 1,
        experiencePoints: 0, // Starting XP for new characters
        hitPoints: calculateHitPoints(
          formData.class,
          finalAbilityScores.constitution
        ),
        armorClass: calculateArmorClass(finalAbilityScores.dexterity),
        proficiencyBonus: getProficiencyBonus(1),
        actions: [] as Id<"actions">[], 
        characterType: formData.characterType,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      await createCharacter(characterData);
      navigate("/characters");
    } catch (error) {
      console.error("Error creating character:", error);
      setErrors({ submit: "Failed to create character. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const finalAbilityScores = calculateFinalAbilityScores();

  return (
    <div className="character-creation-form">
      <h1>Create New Character</h1>

      <form onSubmit={handleSubmit} className="form">
        {/* Basic Information */}
        <div className="form-section">
          <h2>Basic Information</h2>

          <div className="form-group">
            <label htmlFor="name">Character Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={errors.name ? "error" : ""}
              placeholder="Enter character name"
            />
            {errors.name && <span className="error-message">{errors.name}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="race">Race *</label>
              <select
                id="race"
                name="race"
                value={formData.race}
                onChange={handleInputChange}
                className={errors.race ? "error" : ""}
              >
                <option value="">Select Race</option>
                {RACES.map((race) => (
                  <option key={race} value={race}>
                    {race}
                  </option>
                ))}
              </select>
              {errors.race && <span className="error-message">{errors.race}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="class">Class *</label>
              <select
                id="class"
                name="class"
                value={formData.class}
                onChange={handleInputChange}
                className={errors.class ? "error" : ""}
              >
                <option value="">Select Class</option>
                {CLASSES.map((characterClass) => (
                  <option key={characterClass} value={characterClass}>
                    {characterClass}
                  </option>
                ))}
              </select>
              {errors.class && (
                <span className="error-message">{errors.class}</span>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="background">Background *</label>
              <select
                id="background"
                name="background"
                value={formData.background}
                onChange={handleInputChange}
                className={errors.background ? "error" : ""}
              >
                <option value="">Select Background</option>
                {BACKGROUNDS.map((background) => (
                  <option key={background} value={background}>
                    {background}
                  </option>
                ))}
              </select>
              {errors.background && (
                <span className="error-message">{errors.background}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="alignment">Alignment</label>
              <select
                id="alignment"
                name="alignment"
                value={formData.alignment}
                onChange={handleInputChange}
              >
                <option value="">Select Alignment (Optional)</option>
                {ALIGNMENTS.map((alignment) => (
                  <option key={alignment} value={alignment}>
                    {alignment}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="characterType">Character Type *</label>
            <select
              id="characterType"
              name="characterType"
              value={formData.characterType}
              onChange={handleInputChange}
              className={errors.characterType ? "error" : ""}
            >
              <option value="PlayerCharacter">Player Character</option>
              <option value="NonPlayerCharacter">Non-Player Character (NPC)</option>
            </select>
            {errors.characterType && (
              <span className="error-message">{errors.characterType}</span>
            )}
          </div>
        </div>

        {/* Ability Scores */}
        <div className="form-section">
          <div className="ability-scores-header">
            <h2>Ability Scores</h2>
            <button
              type="button"
              onClick={randomizeAllAbilityScores}
              className="btn btn-secondary"
            >
              Randomize All
            </button>
          </div>

          <div className="ability-scores-grid">
            {Object.entries(formData.abilityScores).map(([ability, value]) => {
              const finalValue = finalAbilityScores[ability as keyof AbilityScores];
              const modifier = getAbilityModifier(finalValue);
              const racialBonus = finalValue - value;

              return (
                <div key={ability} className="ability-score-group">
                  <label>{ability.charAt(0).toUpperCase() + ability.slice(1)}</label>
                  <div className="ability-score-controls">
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={value}
                      onChange={(e) =>
                        handleAbilityScoreChange(
                          ability as keyof AbilityScores,
                          parseInt(e.target.value) || 1
                        )
                      }
                    />
                    <button
                      type="button"
                      onClick={() =>
                        randomizeAbilityScore(ability as keyof AbilityScores)
                      }
                      className="btn btn-small"
                      title="Roll 4d6, drop lowest"
                    >
                      🎲
                    </button>
                  </div>
                  <div className="ability-score-display">
                    <span className="final-score">
                      {finalValue}
                      {racialBonus > 0 && (
                        <span className="racial-bonus"> (+{racialBonus})</span>
                      )}
                    </span>
                    <span className="modifier">
                      {modifier >= 0 ? "+" : ""}
                      {modifier}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Character Preview */}
        {formData.race && formData.class && formData.background && (
          <div className="form-section">
            <h2>Character Preview - {formData.characterType === "PlayerCharacter" ? "Player Character" : "NPC"}</h2>
            <div className="character-preview">
              <div className="preview-stats">
                <div className="stat">
                  <strong>Hit Points:</strong>{" "}
                  {calculateHitPoints(formData.class, finalAbilityScores.constitution)}
                </div>
                <div className="stat">
                  <strong>Armor Class:</strong>{" "}
                  {calculateArmorClass(finalAbilityScores.dexterity)}
                </div>
                <div className="stat">
                  <strong>Proficiency Bonus:</strong> +{getProficiencyBonus(1)}
                </div>
                {formData.characterType === "PlayerCharacter" && (
                  <div className="stat">
                    <strong>Starting Experience Points:</strong> 0
                  </div>
                )}
              </div>
              <div className="preview-proficiencies">
                <div>
                  <strong>Saving Throws:</strong>{" "}
                  {getClassSavingThrows(formData.class).join(", ")}
                </div>
                <div>
                  <strong>Skills:</strong>{" "}
                  {[
                    ...new Set([
                      ...getClassSkills(formData.class),
                      ...getBackgroundSkills(formData.background),
                    ]),
                  ].join(", ")}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Submit */}
        <div className="form-actions">
          {errors.submit && (
            <div className="error-message">{errors.submit}</div>
          )}
          <button
            type="button"
            onClick={() => navigate("/characters")}
            className="btn btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary"
          >
            {isSubmitting 
              ? `Creating ${formData.characterType === "PlayerCharacter" ? "Character" : "NPC"}...` 
              : `Create ${formData.characterType === "PlayerCharacter" ? "Character" : "NPC"}`
            }
          </button>
        </div>
      </form>
    </div>
  );
};

export default CharacterCreationForm;
