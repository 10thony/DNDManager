import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { useSearchParams } from "react-router-dom";
import { api } from "../../convex/_generated/api";
import { PlayerCharacter } from "../types/character";
import { getAbilityModifier } from "../types/dndRules";
import CharacterForm from "./CharacterForm";
import { useUser } from "@clerk/clerk-react";
import "./CharacterList.css";

const NPCsList: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [isCreating, setIsCreating] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const { user } = useUser();
  const npcs = useQuery(api.npcs.getAllNpcs);
  const deleteNpc = useMutation(api.npcs.deleteNpc);
  const importNpcData = useMutation(api.npcs.importNpcData);

  // Check if we should show creation form based on query parameter
  useEffect(() => {
    const shouldCreate = searchParams.get('create') === 'true';
    if (shouldCreate) {
      setIsCreating(true);
    }
  }, [searchParams]);

  console.log("NPCs data:", npcs); // Debug log

  const handleDelete = async (npcId: string) => {
    if (window.confirm("Are you sure you want to delete this NPC?")) {
      try {
        await deleteNpc({ id: npcId as any });
      } catch (error) {
        console.error("Error deleting NPC:", error);
      }
    }
  };

  const handleImportData = async () => {
    if (!user) {
      alert("You must be logged in to import NPCs.");
      return;
    }

    setIsImporting(true);
    try {
      const result = await importNpcData({ clerkId: user.id });
      console.log("Import successful:", result);
      alert(`Successfully imported ${result.npcs.length} NPCs!`);
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
            {returnTo === 'campaign-form' ? "← Back to Campaign Form" : "← Back to NPCs"}
          </button>
        </div>
        <CharacterForm 
          onSuccess={handleSubmitSuccess}
          defaultCharacterType="NonPlayerCharacter"
        />
      </div>
    );
  }

  if (npcs === undefined) {
    console.log("NPCs are undefined - still loading"); // Debug log
    return (
      <div className="character-list">
        <div className="loading">Loading NPCs...</div>
      </div>
    );
  }

  if (npcs === null) {
    console.log("NPCs are null - error occurred"); // Debug log
    return (
      <div className="character-list">
        <div className="error">Error loading NPCs. Please try again later.</div>
      </div>
    );
  }

  console.log("Number of NPCs:", npcs.length); // Debug log

  return (
    <div className="character-list">
      <div className="character-list-header">
        <div className="header-content">
          <h2 className="character-list-title">Your NPCs</h2>
          <p className="character-list-subtitle">
            Manage and organize all non-player characters in your campaign
          </p>
        </div>
        <button
          className="create-button"
          onClick={() => setIsCreating(true)}
        >
          <span className="button-icon">+</span>
          Create New NPC
        </button>
      </div>

      {npcs.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">👥</div>
          <h3>No NPCs Yet</h3>
          <p>Create your first D&D NPC to get started!</p>
          <div className="empty-state-buttons">
            <button
              onClick={() => setIsCreating(true)}
              className="create-button"
            >
              Create Your First NPC
            </button>
            <button
              onClick={handleImportData}
              disabled={isImporting}
              className="import-button"
              style={{ marginLeft: '10px' }}
            >
              {isImporting ? "🔄 Importing..." : "📥 Generate Sample NPCs"}
            </button>
          </div>
        </div>
      ) : (
        <div className="characters-grid">
          {npcs.map((npc: PlayerCharacter) => (
            <div key={npc._id} className="character-card">
              <div className="character-card-header">
                <h3>{npc.name}</h3>
                <div className="character-card-actions">
                  <button
                    onClick={() => handleDelete(npc._id!)}
                    className="btn btn-small btn-danger"
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div className="character-basic-info">
                <div className="character-identity">
                  <span className="race">{npc.race}</span>
                  <span className="class">{npc.class}</span>
                  <span className="level">Level {npc.level}</span>
                  <span className="character-type">{npc.characterType}</span>
                </div>
                <div className="character-background">
                  {npc.background}
                </div>
                {npc.alignment && (
                  <div className="character-alignment">
                    {npc.alignment}
                  </div>
                )}
              </div>

              <div className="character-stats">
                <div className="stat-group">
                  <div className="stat">
                    <span className="stat-label">HP</span>
                    <span className="stat-value">{npc.hitPoints}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">AC</span>
                    <span className="stat-value">{npc.armorClass}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Prof</span>
                    <span className="stat-value">
                      +{npc.proficiencyBonus}
                    </span>
                  </div>
                </div>

                <div className="ability-scores-summary">
                  {Object.entries(npc.abilityScores).map(
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
                  <span>{npc.savingThrows.join(", ")}</span>
                </div>
                <div className="proficiency-group">
                  <strong>Skills:</strong>
                  <span>{npc.skills.slice(0, 3).join(", ")}</span>
                  {npc.skills.length > 3 && (
                    <span className="more-skills">
                      {" "}
                      +{npc.skills.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              <div className="character-created">
                Created: {new Date(npc.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NPCsList; 