import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import MonsterForm from "./MonsterForm";
import "./MonsterList.css";

// Import the monsters data with proper typing
import monstersData from "../data/monsters";
import { MonsterData } from "../types/monsters";

const MonsterList: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [isCreating, setIsCreating] = useState(false);
  const [editingMonster, setEditingMonster] = useState<Id<"monsters"> | null>(null);
  const [isDeleting, setIsDeleting] = useState<Id<"monsters"> | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const navigate = useNavigate();
  const monsters = useQuery(api.monsters.getAllMonsters);
  const campaigns = useQuery(api.campaigns.getAllCampaigns);
  const deleteMonster = useMutation(api.monsters.deleteMonster);
  const bulkCreateMonsters = useMutation(api.monsters.bulkCreateMonsters);

  // Check if we should show creation form based on query parameter
  useEffect(() => {
    const shouldCreate = searchParams.get('create') === 'true';
    if (shouldCreate) {
      setIsCreating(true);
    }
  }, [searchParams]);

  const handleDelete = async (id: Id<"monsters">) => {
    if (window.confirm("Are you sure you want to delete this monster? This action cannot be undone.")) {
      setIsDeleting(id);
      try {
        await deleteMonster({ id });
      } catch (error) {
        console.error("Error deleting monster:", error);
        alert("Failed to delete monster. Please try again.");
      } finally {
        setIsDeleting(null);
      }
    }
  };

  const handleEdit = (id: Id<"monsters">) => {
    setEditingMonster(id);
  };

  const handleMonsterClick = (id: Id<"monsters">) => {
    navigate(`/monsters/${id}`);
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingMonster(null);
    // Clear the create query parameter if it exists
    if (searchParams.get('create') === 'true') {
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete('create');
      window.history.replaceState(null, '', `?${newSearchParams.toString()}`);
    }
  };

  const handleSubmitSuccess = () => {
    setIsCreating(false);
    setEditingMonster(null);
    // Clear the create query parameter if it exists
    if (searchParams.get('create') === 'true') {
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete('create');
      window.history.replaceState(null, '', `?${newSearchParams.toString()}`);
    }
  };

  const handleImportMonsters = async () => {
    if (window.confirm("This will import all monsters from the monsters.json file. Are you sure you want to continue?")) {
      setIsImporting(true);
      try {
        console.log("Starting monster import...");
        console.log("Total monsters to import:", monstersData.length);
        console.log("First monster sample:", monstersData[0]);
        
        // Transform the monsters data to match the expected format
        const transformedMonsters = monstersData.map((monster: MonsterData, index: number) => {
          console.log(`Processing monster ${index + 1}: ${monster.name}`);
          
          // Destructure to exclude timestamp fields that Convex handles automatically
          const { createdAt, updatedAt, ...monsterWithoutTimestamps } = monster;
          
          return {
            ...monsterWithoutTimestamps,
            // Don't assign a campaignId - let monsters be unassigned initially
            campaignId: undefined,
            // Ensure all required fields are properly formatted
            hitDice: {
              count: Number(monster.hitDice.count),
              die: monster.hitDice.die as "d4" | "d6" | "d8" | "d10" | "d12"
            },
            size: monster.size as "Tiny" | "Small" | "Medium" | "Large" | "Huge" | "Gargantuan",
            // Ensure numeric fields are properly typed
            armorClass: Number(monster.armorClass),
            hitPoints: Number(monster.hitPoints),
            proficiencyBonus: Number(monster.proficiencyBonus),
            abilityScores: {
              strength: Number(monster.abilityScores.strength),
              dexterity: Number(monster.abilityScores.dexterity),
              constitution: Number(monster.abilityScores.constitution),
              intelligence: Number(monster.abilityScores.intelligence),
              wisdom: Number(monster.abilityScores.wisdom),
              charisma: Number(monster.abilityScores.charisma),
            },
            senses: {
              ...monster.senses,
              passivePerception: Number(monster.senses.passivePerception),
            },
            // Convert null values to undefined for optional fields
            source: monster.source || undefined,
            page: monster.page || undefined,
            tags: monster.tags || undefined,
            armorType: monster.armorType || undefined,
            savingThrows: monster.savingThrows || undefined,
            skills: monster.skills || undefined,
            damageVulnerabilities: monster.damageVulnerabilities || undefined,
            damageResistances: monster.damageResistances || undefined,
            damageImmunities: monster.damageImmunities || undefined,
            conditionImmunities: monster.conditionImmunities || undefined,
            languages: monster.languages || undefined,
            experiencePoints: monster.experiencePoints ? Number(monster.experiencePoints) : undefined,
            traits: monster.traits || undefined,
            actions: monster.actions || undefined,
            reactions: monster.reactions || undefined,
            legendaryActions: monster.legendaryActions || undefined,
            lairActions: monster.lairActions || undefined,
            regionalEffects: monster.regionalEffects || undefined,
            environment: monster.environment || undefined,
          };
        });

        console.log("Transformed monsters count:", transformedMonsters.length);
        console.log("Sample transformed monster:", transformedMonsters[0]);

        await bulkCreateMonsters({ monsters: transformedMonsters });
        console.log("Bulk create completed successfully");
        alert(`Successfully imported ${monstersData.length} monsters!`);
      } catch (error) {
        console.error("Error importing monsters:", error);
        alert("Failed to import monsters. Please try again.");
      } finally {
        setIsImporting(false);
      }
    }
  };

  if (!monsters) {
    return (
      <div className="monsters-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading monsters...</p>
        </div>
      </div>
    );
  }

  if (isCreating || editingMonster) {
    return (
      <div className="monsters-container">
        <MonsterForm
          onSubmitSuccess={handleSubmitSuccess}
          onCancel={handleCancel}
          editingMonsterId={editingMonster}
        />
      </div>
    );
  }

  return (
    <div className="monsters-container">
      <div className="monsters-header">
        <div className="header-content">
          <h2 className="monsters-title">Monsters</h2>
          <p className="monsters-subtitle">
            Manage and organize all monsters for your campaigns
          </p>
        </div>
        <button
          className="create-button"
          onClick={() => setIsCreating(true)}
        >
          <span className="button-icon">+</span>
          Create New Monster
        </button>
      </div>

      {monsters.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">👹</div>
          <h3>No Monsters Yet</h3>
          <p>Get started by creating your first monster or importing sample monsters.</p>
          <div className="empty-state-buttons">
            <button
              className="create-button"
              onClick={() => setIsCreating(true)}
            >
              Create Your First Monster
            </button>
            <button
              className="import-button"
              onClick={handleImportMonsters}
              disabled={isImporting}
            >
              {isImporting ? "🔄 Importing..." : "📥 Import Sample Monsters"}
            </button>
          </div>
        </div>
      ) : (
        <div className="monsters-grid">
          {monsters.map((monster) => (
            <div key={monster._id} className="monster-card" onClick={() => handleMonsterClick(monster._id)}>
              <div className="monster-header">
                <div className="monster-title-section">
                  <h3 className="monster-name">{monster.name}</h3>
                  <div className="monster-type-badge">{monster.type}</div>
                </div>
                <div className="monster-cr-badge">CR {monster.challengeRating}</div>
              </div>
              
              <div className="monster-details">
                <div className="monster-meta">
                  <span className="monster-size">{monster.size}</span>
                  <span className="monster-alignment">{monster.alignment}</span>
                  {monster.source && (
                    <span className="source-book">📖 {monster.source}</span>
                  )}
                </div>
                
                <div className="monster-stats">
                  <div className="stat-item">
                    <span className="stat-label">HP:</span>
                    <span className="stat-value">{monster.hitPoints}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">AC:</span>
                    <span className="stat-value">{monster.armorClass}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">XP:</span>
                    <span className="stat-value">{monster.experiencePoints?.toLocaleString() || "N/A"}</span>
                  </div>
                </div>
              </div>
              
              <div className="monster-actions" onClick={(e) => e.stopPropagation()}>
                <button
                  className="edit-button"
                  onClick={() => handleEdit(monster._id)}
                  title="Edit this monster"
                >
                  ✏️ Edit
                </button>
                <button
                  className="delete-button"
                  onClick={() => handleDelete(monster._id)}
                  disabled={isDeleting === monster._id}
                  title="Delete this monster"
                >
                  {isDeleting === monster._id ? "🗑️ Deleting..." : "🗑️ Delete"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MonsterList; 