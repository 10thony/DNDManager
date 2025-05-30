import React from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { getAbilityModifier } from "../types/dndRules";
import "./CharacterDetail.css";

const CharacterDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const character = useQuery(api.characters.getCharacterById, {
    id: id as any,
  });
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
        <div className="loading">Loading character...</div>
      </div>
    );
  }

  if (character === null) {
    return (
      <div className="character-detail">
        <div className="error">Character not found</div>
        <Link to="/characters" className="btn btn-primary">
          Back to Characters
        </Link>
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
                <strong>Race:</strong> {character.race}
              </div>
              <div className="info-item">
                <strong>Class:</strong> {character.class}
              </div>
              <div className="info-item">
                <strong>Background:</strong> {character.background}
              </div>
              {character.alignment && (
                <div className="info-item">
                  <strong>Alignment:</strong> {character.alignment}
                </div>
              )}
              <div className="info-item">
                <strong>Level:</strong> {character.level}
              </div>
              <div className="info-item">
                <strong>Proficiency Bonus:</strong> +{character.proficiencyBonus}
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
                  <li key={index}>{trait}</li>
                ))}
              </ul>
            </div>
          )}

          {character.languages && character.languages.length > 0 && (
            <div className="info-section">
              <h2>Languages</h2>
              <div className="language-list">
                {character.languages.join(", ")}
              </div>
            </div>
          )}

          {character.equipment && character.equipment.length > 0 && (
            <div className="info-section">
              <h2>Equipment</h2>
              <ul className="equipment-list">
                {character.equipment.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <div className="character-meta">
        <small>
          Created: {new Date(character.createdAt).toLocaleDateString()}
        </small>
      </div>
    </div>
  );
};

export default CharacterDetail;
