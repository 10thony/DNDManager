import React from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { getAbilityModifier, ActionType, AbilityScore, PlayerCharacterAction, DamageDiceType, DamageType } from "../types/dndRules";
import ActionList from "./ActionList";
import "./CharacterDetail.css";
import "./ActionsList.css";

const CharacterDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const character = useQuery(api.characters.getCharacterById, {
    id: id as any,
  });
  const actions = useQuery(api.actions.getActionsByClass, {
    className: character?.class || "",
  });

  // Transform Convex actions to PlayerCharacterAction format
  const transformedActions = (actions?.map(action => {
    const baseAction = {
      id: action._id,
      name: action.name,
      description: action.description,
      actionCost: action.actionCost,
      requiresConcentration: action.requiresConcentration,
      sourceBook: action.sourceBook,
    };

    switch (action.type) {
      case "SPELL":
        if (!action.spellLevel || !action.castingTime || !action.range || !action.components || !action.duration) {
          console.warn(`Incomplete spell action data for ${action.name}`);
          return null;
        }
        return {
          ...baseAction,
          type: ActionType.Spell,
          spellLevel: action.spellLevel,
          castingTime: action.castingTime,
          range: action.range,
          components: action.components,
          duration: action.duration,
          savingThrow: action.savingThrow ? {
            ability: action.savingThrow.ability as AbilityScore,
            onSave: action.savingThrow.onSave
          } : undefined,
          damageRolls: action.damageRolls?.map(roll => ({
            dice: {
              count: roll.dice.count,
              type: roll.dice.type as DamageDiceType
            },
            modifier: roll.modifier,
            damageType: roll.damageType as DamageType
          })) || [],
          spellEffectDescription: action.spellEffectDescription || action.description,
        } as const;
      case "CLASS_FEATURE":
        if (!action.className) {
          console.warn(`Missing className for class feature ${action.name}`);
          return null;
        }
        return {
          ...baseAction,
          type: ActionType.ClassFeature,
          className: action.className,
          usesPer: action.usesPer,
          maxUses: action.maxUses,
        } as const;
      case "MELEE_ATTACK":
      case "RANGED_ATTACK":
        if (!action.attackBonusAbilityScore || !action.isProficient || !action.damageRolls) {
          console.warn(`Incomplete attack action data for ${action.name}`);
          return null;
        }
        return {
          ...baseAction,
          type: action.type === "MELEE_ATTACK" ? ActionType.MeleeAttack : ActionType.RangedAttack,
          attackBonusAbilityScore: action.attackBonusAbilityScore as AbilityScore,
          isProficient: action.isProficient,
          damageRolls: action.damageRolls.map(roll => ({
            dice: {
              count: roll.dice.count,
              type: roll.dice.type as DamageDiceType
            },
            modifier: roll.modifier,
            damageType: roll.damageType as DamageType
          })),
        } as const;
      case "COMMONLY_AVAILABLE_UTILITY":
        return {
          ...baseAction,
          type: ActionType.Utility,
        } as const;
      case "BONUS_ACTION":
        return {
          ...baseAction,
          type: ActionType.BonusAction,
        } as const;
      case "REACTION":
        return {
          ...baseAction,
          type: ActionType.Reaction,
        } as const;
      default:
        return {
          ...baseAction,
          type: ActionType.Other,
        } as const;
    }
  }).filter((action): action is NonNullable<typeof action> => action !== null) || []) as PlayerCharacterAction[];

  const deleteCharacter = useMutation(api.characters.deleteCharacter);

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this character?")) {
      try {
        await deleteCharacter({ id: id as any });
        navigate("/characters");
      } catch (error) {
        console.error("Error deleting character:", error);
      }
    }
  };

  if (character === undefined) {
    return (
      <div className="character-detail">
        <div className="loading text-center py-8 text-lg">Loading character...</div>
      </div>
    );
  }

  if (character === null) {
    return (
      <div className="character-detail">
        <div className="error text-center py-8 text-lg text-red-500">Character not found</div>
        <div className="text-center">
          <Link to="/characters" className="btn btn-primary">
            Back to Characters
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="character-detail">
      <div className="character-detail-header">
        <div className="character-title">
          <h1>{character.name}</h1>
          <div className="character-subtitle">
            Level {character.level} {character.race} {character.class}
          </div>
        </div>
        <div className="character-actions">
          <Link to="/characters" className="btn btn-secondary">
            Back to List
          </Link>
          <button onClick={handleDelete} className="btn btn-danger">
            Delete Character
          </button>
        </div>
      </div>

      <div className="character-detail-content">
        <div className="character-info-grid">
          {/* Basic Information */}
          <div className="info-section">
            <h2>Basic Information</h2>
            <div className="info-grid">
              <div className="info-item">
                <strong>Race:</strong> <span className="text-primary">{character.race}</span>
              </div>
              <div className="info-item">
                <strong>Class:</strong> <span className="text-primary">{character.class}</span>
              </div>
              <div className="info-item">
                <strong>Background:</strong> <span className="text-primary">{character.background}</span>
              </div>
              {character.alignment && (
                <div className="info-item">
                  <strong>Alignment:</strong> <span className="text-primary">{character.alignment}</span>
                </div>
              )}
              <div className="info-item">
                <strong>Level:</strong> <span className="text-primary">{character.level}</span>
              </div>
              <div className="info-item">
                <strong>Proficiency Bonus:</strong> <span className="text-primary">+{character.proficiencyBonus}</span>
              </div>
            </div>
          </div>

          {/* Combat Stats */}
          <div className="info-section">
            <h2>Combat Stats</h2>
            <div className="combat-stats">
              <div className="combat-stat">
                <div className="stat-value">{character.hitPoints}</div>
                <div className="stat-label">Hit Points</div>
              </div>
              <div className="combat-stat">
                <div className="stat-value">{character.armorClass}</div>
                <div className="stat-label">Armor Class</div>
              </div>
              <div className="combat-stat">
                <div className="stat-value">+{character.proficiencyBonus}</div>
                <div className="stat-label">Proficiency</div>
              </div>
            </div>
          </div>

          {/* Ability Scores */}
          <div className="info-section ability-scores-section">
            <h2>Ability Scores</h2>
            <div className="ability-scores-detail">
              {Object.entries(character.abilityScores).map(
                ([ability, score]) => {
                  const modifier = getAbilityModifier(score);
                  return (
                    <div key={ability} className="ability-score-detail">
                      <div className="ability-name">
                        {ability.charAt(0).toUpperCase() + ability.slice(1)}
                      </div>
                      <div className="ability-score-value">{score}</div>
                      <div className="ability-modifier">
                        {modifier >= 0 ? "+" : ""}
                        {modifier}
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          </div>

          {/* Proficiencies */}
          <div className="info-section">
            <h2>Proficiencies</h2>
            <div className="proficiencies-detail">
              <div className="proficiency-category">
                <h3>Saving Throws</h3>
                <div className="proficiency-list">
                  {character.savingThrows.map((savingThrow) => (
                    <span key={savingThrow} className="proficiency-item">
                      {savingThrow}
                    </span>
                  ))}
                </div>
              </div>
              <div className="proficiency-category">
                <h3>Skills</h3>
                <div className="proficiency-list">
                  {character.skills.map((skill) => (
                    <span key={skill} className="proficiency-item">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              {character.proficiencies.length > 0 && (
                <div className="proficiency-category">
                  <h3>Other Proficiencies</h3>
                  <div className="proficiency-list">
                    {character.proficiencies.map((proficiency) => (
                      <span key={proficiency} className="proficiency-item">
                        {proficiency}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Optional Sections */}
          {character.traits && character.traits.length > 0 && (
            <div className="info-section">
              <h2>Traits</h2>
              <ul className="trait-list">
                {character.traits.map((trait, index) => (
                  <li key={index} className="text-primary">{trait}</li>
                ))}
              </ul>
            </div>
          )}

          {character.languages && character.languages.length > 0 && (
            <div className="info-section">
              <h2>Languages</h2>
              <div className="language-list">
                <span className="text-primary">{character.languages.join(", ")}</span>
              </div>
            </div>
          )}

          {character.equipment && character.equipment.length > 0 && (
            <div className="info-section">
              <h2>Equipment</h2>
              <ul className="equipment-list">
                {character.equipment.map((item, index) => (
                  <li key={index} className="text-primary">{item}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Actions Section */}
          <div className="info-section">
            <h2>Actions & Abilities</h2>
            {transformedActions.length > 0 ? (
              <ActionList actions={transformedActions} />
            ) : (
              <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                No actions available for this character.
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="character-meta">
        <small className="text-gray-600 dark:text-gray-400">
          Created: {new Date(character.createdAt).toLocaleDateString()}
        </small>
      </div>
    </div>
  );
};

export default CharacterDetail;
