import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../../convex/_generated/api";
import { PlayerCharacter } from "../types/character";
import { getAbilityModifier } from "../types/dndRules";
import CharacterForm from "./CharacterForm";
import { useRoleAccess } from "../hooks/useRoleAccess";
import { useUser } from "@clerk/clerk-react";
import "./CharacterList.css";

const CharacterList: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [isCreating, setIsCreating] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const { user } = useUser();
  const { isAdmin } = useRoleAccess();
  
  // Get user's database ID - always call this hook
  const userRecord = useQuery(api.users.getUserByClerkId, 
    user?.id ? { clerkId: user.id } : "skip"
  );
  
  // Get characters based on user role - always call both hooks
  const allCharacters = useQuery(api.characters.getAllCharacters);
  const userCharacters = useQuery(
    api.characters.getCharactersByUserId,
    userRecord?._id ? { userId: userRecord._id } : "skip"
  );
  
  // Use appropriate character list based on user role
  const characters = Array.isArray(isAdmin ? allCharacters : userCharacters) ? (isAdmin ? allCharacters : userCharacters) : [];
  
  const deleteCharacter = useMutation(api.characters.deleteCharacter);
  const importPlayerData = useMutation(api.characters.importPlayerData);

  // Check if we should show creation form based on query parameter
  useEffect(() => {
    const shouldCreate = searchParams.get('create') === 'true';
    if (shouldCreate) {
      setIsCreating(true);
    }
  }, [searchParams]);

  console.log("Characters data:", characters); // Debug log
  console.log("allCharacters:", allCharacters); // Debug log
  console.log("userCharacters:", userCharacters); // Debug log
  console.log("isAdmin:", isAdmin); // Debug log
  console.log("userRecord:", userRecord); // Debug log

  const handleDelete = async (characterId: string) => {
    if (window.confirm("Are you sure you want to delete this character?")) {
      try {
        await deleteCharacter({ id: characterId as any });
      } catch (error) {
        console.error("Error deleting character:", error);
      }
    }
  };

  const handleImportData = async () => {
    if (!user?.id) return;
    
    setIsImporting(true);
    try {
      const result = await importPlayerData({ clerkId: user.id });
      console.log("Import successful:", result);
      alert(`Successfully imported ${result.playerCharacters.length} player characters!`);
    } catch (error) {
      console.error("Error importing data:", error);
      alert("Error importing data. Please try again.");
    } finally {
      setIsImporting(false);
    }
  };

  const handleCancel = () => {
    const returnTo = searchParams.get('returnTo');
    if (returnTo === 'campaign-form') {
      window.location.href = "/campaigns/new";
    } else {
      setIsCreating(false);
      // Clear the create query parameter if it exists
      if (searchParams.get('create') === 'true') {
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.delete('create');
        window.history.replaceState(null, '', `?${newSearchParams.toString()}`);
      }
    }
  };

  const handleSubmitSuccess = () => {
    const returnTo = searchParams.get('returnTo');
    if (returnTo === 'campaign-form') {
      window.location.href = "/campaigns/new";
    } else {
      setIsCreating(false);
      // Clear the create query parameter if it exists
      if (searchParams.get('create') === 'true') {
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.delete('create');
        window.history.replaceState(null, '', `?${newSearchParams.toString()}`);
      }
    }
  };

  if (isCreating) {
    const returnTo = searchParams.get('returnTo');
    return (
      <div className="character-list">
        <div className="character-list-header">
          <button
            onClick={handleCancel}
            className="back-button"
          >
            {returnTo === 'campaign-form' ? "← Back to Campaign Form" : "← Back to Characters"}
          </button>
        </div>
        <CharacterForm onSuccess={handleSubmitSuccess} />
      </div>
    );
  }

  // Check if any of the queries are still loading
  if (allCharacters === undefined || userCharacters === undefined) {
    console.log("Queries are still loading - allCharacters:", allCharacters, "userCharacters:", userCharacters);
    return (
      <div className="character-list">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading characters...</p>
        </div>
      </div>
    );
  }

  // Check if any of the queries returned an error
  if (allCharacters === null || userCharacters === null) {
    console.log("Queries returned null - allCharacters:", allCharacters, "userCharacters:", userCharacters);
    return (
      <div className="character-list">
        <div className="error">Error loading characters. Please try again later.</div>
      </div>
    );
  }

  console.log("Number of characters:", characters?.length || 0); // Debug log

  // Debug log for troubleshooting
  console.log("DEBUG: characters:", characters, "hasAnyCharacters:", (characters?.length || 0) > 0);

  const hasAnyCharacters = (characters?.length || 0) > 0;

  return (
    <div className="character-list">
      <div className="character-list-header">
        <div className="header-content">
          <h2 className="character-list-title">{isAdmin ? "All Characters" : "My Characters"}</h2>
          <p className="character-list-subtitle">
            Manage and organize all player characters and NPCs in your campaign
          </p>
        </div>
        <button
          className="create-button"
          onClick={() => setIsCreating(true)}
        >
          <span className="button-icon">+</span>
          Create New Character
        </button>
      </div>

      {!hasAnyCharacters ? (
        <div className="empty-state">
          <div className="empty-icon">👥</div>
          <h3>No Characters Yet</h3>
          <p>{isAdmin ? "No characters have been created yet." : "You haven't created any characters yet."}</p>
          <div className="empty-state-buttons">
            <button
              onClick={() => setIsCreating(true)}
              className="create-button"
            >
              Create Your First Character
            </button>
            <button
              onClick={handleImportData}
              disabled={isImporting}
              className="import-button"
              style={{ marginLeft: '10px' }}
            >
              {isImporting ? "🔄 Importing..." : "📥 Generate Sample Data"}
            </button>
          </div>
        </div>
      ) : (
        <div className="characters-grid">
          {characters?.map((character: PlayerCharacter) => (
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
                  <span className="character-type">{character.characterType}</span>
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
