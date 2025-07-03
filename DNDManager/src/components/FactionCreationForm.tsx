import React, { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import "./FactionCreationForm.css";

interface FactionCreationFormProps {
  editingFactionId?: Id<"factions"> | null;
}

const FactionCreationForm: React.FC<FactionCreationFormProps> = ({
  editingFactionId,
}) => {
  const { user } = useUser();
  const navigate = useNavigate();
  const createFaction = useMutation(api.factions.createFaction);
  const updateFaction = useMutation(api.factions.updateFaction);
  const faction = useQuery(
    api.factions.getFactionById,
    editingFactionId ? { factionId: editingFactionId } : "skip"
  );

  // Fetch NPCs and factions for dropdowns
  const npcs = useQuery(api.npcs.getAllNpcs);
  const factions = useQuery(api.factions.getFactions, {});

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    goals: [] as string[],
    leaderNpcIds: [] as Id<"npcs">[],
    alliedFactionIds: [] as Id<"factions">[],
    enemyFactionIds: [] as Id<"factions">[],
    reputation: [] as Array<{
      playerCharacterId: Id<"playerCharacters">;
      score: number;
    }>,
  });

  const [newGoal, setNewGoal] = useState("");

  useEffect(() => {
    if (faction && editingFactionId) {
      setFormData({
        name: faction.name,
        description: faction.description,
        goals: faction.goals || [],
        leaderNpcIds: faction.leaderNpcIds || [],
        alliedFactionIds: faction.alliedFactionIds || [],
        enemyFactionIds: faction.enemyFactionIds || [],
        reputation: faction.reputation || [],
      });
    }
  }, [faction, editingFactionId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // For now, we'll use a default campaign ID
      // In a real app, you'd get this from context or props
      const defaultCampaignId = "default" as Id<"campaigns">;

      if (editingFactionId) {
        await updateFaction({
          factionId: editingFactionId,
          ...formData,
        });
      } else {
        await createFaction({
          campaignId: defaultCampaignId,
          ...formData,
          clerkId: user!.id,
        });
      }
      navigate("/factions");
    } catch (error) {
      console.error("Error saving faction:", error);
      setError(error instanceof Error ? error.message : "Failed to save faction");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleMultiSelectChange = (field: keyof typeof formData, value: string, checked: boolean) => {
    setFormData(prev => {
      const currentArray = prev[field] as string[];
      if (checked) {
        return {
          ...prev,
          [field]: [...currentArray, value],
        };
      } else {
        return {
          ...prev,
          [field]: currentArray.filter(id => id !== value),
        };
      }
    });
  };

  const addGoal = () => {
    if (newGoal.trim()) {
      setFormData(prev => ({
        ...prev,
        goals: [...prev.goals, newGoal.trim()],
      }));
      setNewGoal("");
    }
  };

  const removeGoal = (index: number) => {
    setFormData(prev => ({
      ...prev,
      goals: prev.goals.filter((_, i) => i !== index),
    }));
  };

  const handleCancel = () => {
    navigate("/factions");
  };

  // Filter out the current faction from the factions list when editing
  const availableFactions = factions?.filter(f => !editingFactionId || f._id !== editingFactionId) || [];

  return (
    <div className="faction-form">
      <div className="form-header">
        <button type="button" onClick={handleCancel} className="back-button">
          ← Back to Factions List
        </button>
        <h2 className="form-section-title">
          {editingFactionId ? "Edit Faction" : "Create New Faction"}
        </h2>
      </div>

      {error && <div className="form-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        {/* Basic Information Section */}
        <div className="form-section">
          <div className="form-section-title">Basic Information</div>
          <div className="form-row">
            <div className="form-col">
              <label htmlFor="name" className="form-label">Faction Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                className="form-input"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Enter faction name"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-col full-width">
              <label htmlFor="description" className="form-label">Description *</label>
              <textarea
                id="description"
                name="description"
                className="form-textarea"
                value={formData.description}
                onChange={handleChange}
                required
                rows={4}
                placeholder="Enter a detailed description of the faction..."
              />
            </div>
          </div>
        </div>

        {/* Goals Section */}
        <div className="form-section">
          <div className="form-section-title">Goals</div>
          <div className="form-row">
            <div className="form-col full-width">
              <label className="form-label">Faction Goals</label>
              <div className="goals-input-group">
                <input
                  type="text"
                  className="form-input"
                  value={newGoal}
                  onChange={(e) => setNewGoal(e.target.value)}
                  placeholder="Enter a goal for this faction"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addGoal();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={addGoal}
                  className="btn-secondary"
                  disabled={!newGoal.trim()}
                >
                  Add Goal
                </button>
              </div>
              
              {formData.goals.length > 0 && (
                <div className="goals-list">
                  {formData.goals.map((goal, index) => (
                    <div key={index} className="goal-item">
                      <span className="goal-text">{goal}</span>
                      <button
                        type="button"
                        onClick={() => removeGoal(index)}
                        className="remove-goal-btn"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Relationships Section */}
        <div className="form-section">
          <div className="form-section-title">Relationships</div>
          
          {/* Leader NPCs */}
          <div className="form-row">
            <div className="form-col full-width">
              <label className="form-label">Leader NPCs</label>
              <div className="multi-select-container">
                {npcs && npcs.length > 0 ? (
                  <div className="checkbox-group">
                    {npcs.map((npc) => (
                      <label key={npc._id} className="checkbox-item">
                        <input
                          type="checkbox"
                          checked={formData.leaderNpcIds.includes(npc._id)}
                          onChange={(e) => handleMultiSelectChange(
                            'leaderNpcIds', 
                            npc._id, 
                            e.target.checked
                          )}
                        />
                        <span className="checkbox-label">{npc.name}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <p className="form-help-text">No NPCs available. Create some NPCs first.</p>
                )}
              </div>
            </div>
          </div>

          {/* Allied Factions */}
          <div className="form-row">
            <div className="form-col full-width">
              <label className="form-label">Allied Factions (Optional)</label>
              <div className="multi-select-container">
                {availableFactions.length > 0 ? (
                  <div className="checkbox-group">
                    {availableFactions.map((faction) => (
                      <label key={faction._id} className="checkbox-item">
                        <input
                          type="checkbox"
                          checked={formData.alliedFactionIds.includes(faction._id)}
                          onChange={(e) => handleMultiSelectChange(
                            'alliedFactionIds', 
                            faction._id, 
                            e.target.checked
                          )}
                        />
                        <span className="checkbox-label">{faction.name}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <p className="form-help-text">No other factions available to ally with.</p>
                )}
              </div>
            </div>
          </div>

          {/* Enemy Factions */}
          <div className="form-row">
            <div className="form-col full-width">
              <label className="form-label">Enemy Factions (Optional)</label>
              <div className="multi-select-container">
                {availableFactions.length > 0 ? (
                  <div className="checkbox-group">
                    {availableFactions.map((faction) => (
                      <label key={faction._id} className="checkbox-item">
                        <input
                          type="checkbox"
                          checked={formData.enemyFactionIds.includes(faction._id)}
                          onChange={(e) => handleMultiSelectChange(
                            'enemyFactionIds', 
                            faction._id, 
                            e.target.checked
                          )}
                        />
                        <span className="checkbox-label">{faction.name}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <p className="form-help-text">No other factions available to set as enemies.</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={isLoading}>
            {isLoading ? "Saving..." : (editingFactionId ? "Save Changes" : "Create Faction")}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FactionCreationForm; 