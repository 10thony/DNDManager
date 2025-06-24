import React, { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { useNavigate } from "react-router-dom";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import "./FactionCreationForm.css";

interface FactionCreationFormProps {
  editingFactionId?: Id<"factions"> | null;
}

const FactionCreationForm: React.FC<FactionCreationFormProps> = ({
  editingFactionId,
}) => {
  const navigate = useNavigate();
  const createFaction = useMutation(api.factions.createFaction);
  const updateFaction = useMutation(api.factions.updateFaction);
  const faction = useQuery(api.factions.getFactionById, {
    factionId: editingFactionId!,
  });

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
          <div className="form-row">
            <div className="form-col">
              <label className="form-label">Leader NPCs</label>
              <p className="form-help-text">
                Select NPCs who lead this faction (coming soon)
              </p>
            </div>
            <div className="form-col">
              <label className="form-label">Allied Factions</label>
              <p className="form-help-text">
                Select factions allied with this one (coming soon)
              </p>
            </div>
          </div>
          <div className="form-row">
            <div className="form-col">
              <label className="form-label">Enemy Factions</label>
              <p className="form-help-text">
                Select factions opposed to this one (coming soon)
              </p>
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