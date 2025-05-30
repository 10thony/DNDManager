import React from "react";
import { useQuery, useMutation } from "convex/react";
import { Link } from "react-router-dom";
import { api } from "../../convex/_generated/api";
import { PlayerCharacter } from "../types/character";
import { getAbilityModifier } from "../types/dndRules";
import "./CharacterList.css";

const CharacterList: React.FC = () => {
  const characters = useQuery(api.characters.getAllCharacters);
  const deleteCharacter = useMutation(api.characters.deleteCharacter);

  const handleDelete = async (characterId: string) => {
    if (window.confirm("Are you sure you want to delete this character?")) {
      try {
        await deleteCharacter({ id: characterId as any });
      } catch (error) {
        console.error("Error deleting character:", error);
      }
    }
  };

  if (characters === undefined) {
    return (
      <div className="character-list">
        <div className="loading">Loading characters...</div>
      </div>
    );
  }

  return (
    <div className="character-list">
      <div className="character-list-header">
        <h1>Your Characters</h1>
        <Link to="/create-character" className="btn btn-primary">
          Create New Character
        </Link>
      </div>

      {characters.length === 0 ? (
        <div className="empty-state">
          <h2>No Characters Yet</h2>
          <p>Create your first D&D character to get started!</p>
          <Link to="/create-character" className="btn btn-primary">
            Create Character
          </Link>
        </div>
      ) : (
        <div className="characters-grid">
          {characters.map((character: PlayerCharacter) => (
            <div key={character._id} className="character-card">
              <div className="character-card-header">
                <h3>{character.name}</h3>
                <div className="character-card-actions">
                  <Link
                    to={`/characters/${character._id}`}
                    className="btn btn-small btn-secondary"
                  >
                    View
                  </Link>
                  <button
                    onClick={() => handleDelete(character._id!)}
                    className="btn btn-small btn-danger"
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div className="character-basic-info">
                <div className="character-identity">
                  <span className="race">{character.race}</span>
                  <span className="class">{character.class}</span>
                  <span className="level">Level {character.level}</span>
                </div>
                <div className="character-background">
                  {character.background}
                </div>
                {character.alignment && (
                  <div className="character-alignment">
                    {character.alignment}
                  </div>
                )}
              </div>

              <div className="character-stats">
                <div className="stat-group">
                  <div className="stat">
                    <span className="stat-label">HP</span>
                    <span className="stat-value">{character.hitPoints}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">AC</span>
                    <span className="stat-value">{character.armorClass}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Prof</span>
                    <span className="stat-value">
                      +{character.proficiencyBonus}
                    </span>
                  </div>
                </div>

                <div className="ability-scores-summary">
                  {Object.entries(character.abilityScores).map(
                    ([ability, score]) => (
                      <div key={ability} className="ability-summary">
                        <span className="ability-name">
                          {ability.slice(0, 3).toUpperCase()}
                        </span>
                        <span className="ability-score">{score}</span>
                        <span className="ability-modifier">
                          {getAbilityModifier(score) >= 0 ? "+" : ""}
                          {getAbilityModifier(score)}
                        </span>
                      </div>
                    )
                  )}
                </div>
              </div>

              <div className="character-proficiencies">
                <div className="proficiency-group">
                  <strong>Saving Throws:</strong>
                  <span>{character.savingThrows.join(", ")}</span>
                </div>
                <div className="proficiency-group">
                  <strong>Skills:</strong>
                  <span>{character.skills.slice(0, 3).join(", ")}</span>
                  {character.skills.length > 3 && (
                    <span className="more-skills">
                      {" "}
                      +{character.skills.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              <div className="character-created">
                Created: {new Date(character.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CharacterList;
