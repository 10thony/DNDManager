import React, { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { api } from "../../convex/_generated/api";
import { CharacterFormData, AbilityScores, RACES, CLASSES, BACKGROUNDS, ALIGNMENTS } from "../types/character";
import { Id } from "../../convex/_generated/dataModel";
import { 
  rollAbilityScore, 
  getRacialBonuses, 
  getAbilityModifier,
  getClassSavingThrows,
  getClassSkills,
  getBackgroundSkills,
  calculateHitPoints,
  calculateArmorClass,
  getProficiencyBonus
} from "../types/dndRules";
import "./CharacterForm.css";

interface CharacterFormProps {
  onSuccess?: () => void;
  defaultCharacterType?: "PlayerCharacter" | "NonPlayerCharacter";
}

const CharacterForm: React.FC<CharacterFormProps> = ({ onSuccess, defaultCharacterType = "PlayerCharacter" }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get('returnTo');
  const { user } = useUser();
  const createCharacter = useMutation(api.characters.createPlayerCharacter);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedActions, setSelectedActions] = useState<Id<"actions">[]>([]);
  const [racialBonusesApplied, setRacialBonusesApplied] = useState(false);
  const [appliedRace, setAppliedRace] = useState<string>("");

  const [formData, setFormData] = useState<CharacterFormData>({
    name: "",
    class: "",
    race: "",
    background: "",
    alignment: "",
    characterType: defaultCharacterType,
    abilityScores: {
      strength: 10,
      dexterity: 10,
      constitution: 10,
      intelligence: 10,
      wisdom: 10,
      charisma: 10,
    },
    factionId: "",
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

    // Reset racial bonuses applied state when race changes
    if (name === "race") {
      setRacialBonusesApplied(false);
      setAppliedRace("");
    }
  };

  const handleAbilityScoreChange = (ability: string, value: number) => {
    setFormData((prev) => ({
      ...prev,
      abilityScores: {
        ...prev.abilityScores,
        [ability]: Math.max(1, Math.min(20, value)),
      },
    }));

    // Reset racial bonuses applied state when manually changing scores
    if (racialBonusesApplied) {
      setRacialBonusesApplied(false);
      setAppliedRace("");
    }
  };

  const handleRollAbilityScore = (ability: string) => {
    const rolledScore = rollAbilityScore();
    handleAbilityScoreChange(ability, rolledScore);
  };

  const handleRollAllAbilityScores = () => {
    const newAbilityScores = {
      strength: rollAbilityScore(),
      dexterity: rollAbilityScore(),
      constitution: rollAbilityScore(),
      intelligence: rollAbilityScore(),
      wisdom: rollAbilityScore(),
      charisma: rollAbilityScore(),
    };
    
    setFormData((prev) => ({
      ...prev,
      abilityScores: newAbilityScores,
    }));

    // Reset racial bonuses applied state when rolling new scores
    setRacialBonusesApplied(false);
    setAppliedRace("");
  };

  const handleApplyRacialBonuses = () => {
    if (!formData.race) {
      setError("Please select a race first to apply racial bonuses");
      return;
    }

    // Check if racial bonuses have already been applied for this race
    if (racialBonusesApplied && appliedRace === formData.race) {
      setError(`${formData.race} racial bonuses have already been applied. You can only apply racial bonuses once per race.`);
      return;
    }

    // If a different race was previously applied, reset the bonuses first
    if (racialBonusesApplied && appliedRace !== formData.race) {
      setError(`You have already applied ${appliedRace} racial bonuses. Please roll new ability scores or change back to ${appliedRace} to apply different racial bonuses.`);
      return;
    }

    const racialBonuses = getRacialBonuses(formData.race);
    setFormData((prev) => ({
      ...prev,
      abilityScores: {
        ...prev.abilityScores,
        ...Object.entries(racialBonuses).reduce((acc, [ability, bonus]) => {
          acc[ability as keyof typeof prev.abilityScores] = 
            (prev.abilityScores[ability as keyof typeof prev.abilityScores] || 0) + (bonus || 0);
          return acc;
        }, {} as typeof prev.abilityScores),
      },
    }));

    // Mark racial bonuses as applied for this race
    setRacialBonusesApplied(true);
    setAppliedRace(formData.race);
    setError(null); // Clear any previous errors
  };

  const getRacialBonusDescription = (race: string): string => {
    const bonuses = getRacialBonuses(race);
    const bonusEntries = Object.entries(bonuses)
      .map(([ability, bonus]) => `${ability} +${bonus}`)
      .join(", ");
    return bonusEntries || "No racial bonuses";
  };

  const calculateTotalPoints = () => {
    return Object.values(formData.abilityScores).reduce((sum, score) => sum + score, 0);
  };

  const getAbilityScoreMethod = () => {
    const total = calculateTotalPoints();
    if (total >= 70 && total <= 80) return "Standard Array (72-78)";
    if (total >= 60 && total <= 85) return "Point Buy (27 points)";
    if (total > 85) return "Rolled (High)";
    if (total < 60) return "Rolled (Low)";
    return "Custom";
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
        abilityScores: {
          strength: Number(finalAbilityScores.strength),
          dexterity: Number(finalAbilityScores.dexterity),
          constitution: Number(finalAbilityScores.constitution),
          intelligence: Number(finalAbilityScores.intelligence),
          wisdom: Number(finalAbilityScores.wisdom),
          charisma: Number(finalAbilityScores.charisma),
        },
        skills: allSkills,
        savingThrows: getClassSavingThrows(formData.class),
        proficiencies: [], // Could be expanded based on race/class
        level: Number(1),
        experiencePoints: Number(0), // Starting XP for new characters
        hitPoints: Number(calculateHitPoints(
          formData.class,
          finalAbilityScores.constitution
        )),
        armorClass: Number(calculateArmorClass(finalAbilityScores.dexterity)),
        proficiencyBonus: Number(getProficiencyBonus(1)),
        actions: selectedActions,
        characterType: formData.characterType,
        factionId: formData.factionId ? (formData.factionId as Id<"factions">) : undefined,
      };

      console.log("Character data being sent:", characterData);
      await createCharacter(characterData);
      
      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      } else {
        // Default navigation behavior
        if (returnTo === 'campaign-form') {
          navigate("/campaigns/new");
        } else {
          if (formData.characterType === "NonPlayerCharacter") {
            navigate("/npcs");
          } else {
            navigate("/characters");
          }
        }
      }
    } catch (error) {
      console.error("Error creating character:", error);
      setError("Failed to create character. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (returnTo === 'campaign-form') {
      navigate("/campaigns/new");
    } else {
      if (formData.characterType === "NonPlayerCharacter") {
        navigate("/npcs");
      } else {
        navigate("/characters");
      }
    }
  };

  // Helper for color and feedback
  const getProgressBarColor = (total: number) => {
    if (total >= 72 && total <= 78) return "green";
    if ((total >= 70 && total < 72) || (total > 78 && total <= 80)) return "yellow";
    return "red";
  };

  const getMethodDescription = (method: string) => {
    switch (method) {
      case "Standard Array (72-78)":
        return "Standard Array: Total ability scores between 72 and 78.";
      case "Point Buy (27 points)":
        return "Point Buy: Custom allocation, usually totaling 27 points.";
      case "Rolled (High)":
        return "Rolled: High total, likely from rolling dice.";
      case "Rolled (Low)":
        return "Rolled: Low total, likely from rolling dice.";
      default:
        return "Custom or unusual method.";
    }
  };

  const getWarning = (total: number) => {
    if (total < 72)
      return "Total is below the standard range. Consider re-rolling or using Standard Array.";
    if (total > 78)
      return "Total is above the standard range. This may be unusually high.";
    return null;
  };

  const AbilityScoresFeedback: React.FC<{ totalPoints: number; method: string }> = ({ totalPoints, method }) => {
    const min = 60, max = 85; // For progress bar scaling
    const percent = Math.min(100, Math.max(0, ((totalPoints - min) / (max - min)) * 100));
    const color = getProgressBarColor(totalPoints);
    const warning = getWarning(totalPoints);
    const methodDescription = getMethodDescription(method);

    return (
      <div className="ability-scores-feedback">
        <div className="points-progress-bar">
          <div className={`progress-bar-fill ${color}`} style={{ width: `${percent}%` }} />
          <span className="points-label">
            <strong>{totalPoints} points</strong>
            <span className={`method-badge ${color}`} title={methodDescription}>
              {method}
            </span>
          </span>
        </div>
        {warning && (
          <div className="points-warning">
            <span>⚠️ {warning}</span>
          </div>
        )}
        <div className="summary-note">
          <small>
            💡 <strong>D&D 5e Methods:</strong> Standard Array (72-78), Point Buy (27), or Roll 4d6 drop lowest
          </small>
        </div>
      </div>
    );
  };

  const finalAbilityScores = calculateFinalAbilityScores();

  return (
    <div className="character-form">
      <h2 className="form-section-title">
        Create New {defaultCharacterType === "NonPlayerCharacter" ? "NPC" : "Character"}
      </h2>

      {error && <div className="form-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        {/* Basic Info Section */}
        <div className="form-section">
          <div className="form-section-title">Basic Information</div>
          <div className="form-row">
            <div className="form-col">
              <label htmlFor="name" className="form-label">Character Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                className="form-input"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-col">
              <label htmlFor="race" className="form-label">Race *</label>
              <select
                id="race"
                name="race"
                className="form-select"
                value={formData.race}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Race</option>
                {RACES.map((race: string) => (
                  <option key={race} value={race}>{race}</option>
                ))}
              </select>
            </div>
            <div className="form-col">
              <label htmlFor="class" className="form-label">Class *</label>
              <select
                id="class"
                name="class"
                className="form-select"
                value={formData.class}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Class</option>
                {CLASSES.map((cls: string) => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-col">
              <label htmlFor="background" className="form-label">Background *</label>
              <select
                id="background"
                name="background"
                className="form-select"
                value={formData.background}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Background</option>
                {BACKGROUNDS.map((background: string) => (
                  <option key={background} value={background}>{background}</option>
                ))}
              </select>
            </div>
            <div className="form-col">
              <label htmlFor="alignment" className="form-label">Alignment</label>
              <select
                id="alignment"
                name="alignment"
                className="form-select"
                value={formData.alignment}
                onChange={handleInputChange}
              >
                <option value="">Select Alignment (Optional)</option>
                {ALIGNMENTS.map((alignment: string) => (
                  <option key={alignment} value={alignment}>{alignment}</option>
                ))}
              </select>
            </div>
            <div className="form-col">
              <label htmlFor="characterType" className="form-label">Character Type *</label>
              <select
                id="characterType"
                name="characterType"
                className="form-select"
                value={formData.characterType}
                onChange={handleInputChange}
                required
              >
                <option value="PlayerCharacter">Player Character</option>
                <option value="NonPlayerCharacter">Non-Player Character</option>
              </select>
            </div>
          </div>
        </div>

        {/* Ability Scores Section */}
        <div className="form-section">
          <div className="form-section-title">Ability Scores</div>
          {racialBonusesApplied && appliedRace && (
            <div className="racial-bonus-indicator">
              <span className="bonus-applied-badge">
                ✓ {appliedRace} Racial Bonuses Applied: {getRacialBonusDescription(appliedRace)}
              </span>
            </div>
          )}
          <div className="ability-scores-controls">
            <button
              type="button"
              onClick={handleRollAllAbilityScores}
              className="roll-all-button"
            >
              Roll All (4d6 drop lowest)
            </button>
            {formData.race && (
              <button
                type="button"
                onClick={handleApplyRacialBonuses}
                className={`racial-bonus-button ${racialBonusesApplied && appliedRace === formData.race ? 'applied' : ''}`}
                disabled={racialBonusesApplied && appliedRace === formData.race}
                title={racialBonusesApplied && appliedRace === formData.race 
                  ? `${appliedRace} bonuses already applied` 
                  : `Apply ${formData.race} racial bonuses: ${getRacialBonusDescription(formData.race)}`}
              >
                {racialBonusesApplied && appliedRace === formData.race 
                  ? `✓ ${formData.race} Bonuses Applied` 
                  : `Apply ${formData.race} Bonuses`}
              </button>
            )}
          </div>
          <div className="racial-bonus-help form-helper">
            <small>
              💡 <strong>Racial Bonuses:</strong> Each race provides specific ability score bonuses. 
              You can only apply racial bonuses once per character. 
              Manual changes to ability scores will reset the bonus status.
            </small>
          </div>
          <div className="ability-scores-grid">
            {Object.entries(formData.abilityScores).map(([ability, score]) => {
              const finalValue = finalAbilityScores[ability as keyof AbilityScores];
              const modifier = getAbilityModifier(finalValue);
              const racialBonus = finalValue - score;

              return (
                <div key={ability} className="ability-score">
                  <label htmlFor={ability} className="form-label">{ability}</label>
                  <div className="ability-score-input-group">
                    <input
                      type="number"
                      id={ability}
                      className="form-input"
                      value={score}
                      onChange={(e) =>
                        handleAbilityScoreChange(ability, parseInt(e.target.value) || 10)
                      }
                      min="1"
                      max="20"
                    />
                    <button
                      type="button"
                      onClick={() => handleRollAbilityScore(ability)}
                      className="roll-button"
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
                      {modifier >= 0 ? "+" : ""}{modifier}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
          <AbilityScoresFeedback totalPoints={calculateTotalPoints()} method={getAbilityScoreMethod()} />
        </div>

        {/* Character Preview */}
        {formData.race && formData.class && formData.background && (
          <div className="form-section">
            <div className="form-section-title">Character Preview - {formData.characterType === "PlayerCharacter" ? "Player Character" : "NPC"}</div>
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

        {/* Actions Section */}
        {formData.class && (
          <div className="form-section">
            <div className="form-section-title">Available Actions</div>
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

        <div className="form-actions">
          <button type="button" onClick={handleCancel} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={isLoading}>
            {isLoading 
              ? `Creating ${formData.characterType === "PlayerCharacter" ? "Character" : "NPC"}...` 
              : `Create ${formData.characterType === "PlayerCharacter" ? "Character" : "NPC"}`
            }
          </button>
        </div>
      </form>
    </div>
  );
};

export default CharacterForm;
