import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import "./InteractionsSection.css";

interface InteractionsSectionProps {
  campaignId: Id<"campaigns">;
  onUpdate: () => void;
}

const InteractionsSection: React.FC<InteractionsSectionProps> = ({
  campaignId,
  onUpdate,
}) => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [errors, setErrors] = useState<string[]>([]);

  const interactions = useQuery(api.interactions.getAllInteractions);
  const createInteraction = useMutation(api.interactions.createInteraction);
  const updateInteraction = useMutation(api.interactions.updateInteraction);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleInteractionClick = (interactionId: Id<"interactions">) => {
    navigate(`/interactions/${interactionId}?fromCampaign=${campaignId}`);
  };

  const handleLinkAction = async (e: React.MouseEvent, interactionId: Id<"interactions">, isLinked: boolean) => {
    e.stopPropagation(); // Prevent navigation when clicking link/unlink button
    try {
      if (isLinked) {
        await updateInteraction({ id: interactionId, campaignId: undefined });
      } else {
        await updateInteraction({ id: interactionId, campaignId });
      }
      onUpdate();
    } catch (error) {
      console.error("Error updating interaction:", error);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: string[] = [];
    
    if (!formData.name.trim()) {
      newErrors.push("Interaction name is required");
    }
    
    if (!formData.description.trim()) {
      newErrors.push("Interaction description is required");
    }
    
    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleCreateInteraction = async () => {
    if (!validateForm()) return;

    try {
      await createInteraction({
        campaignId,
        name: formData.name,
        description: formData.description,
        clerkId: user!.id,
      });

      setFormData({
        name: "",
        description: "",
      });
      setErrors([]);
      setIsCreating(false);
      onUpdate();
    } catch (error) {
      console.error("Error creating interaction:", error);
      setErrors(["Failed to create interaction. Please try again."]);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: "",
      description: "",
    });
    setErrors([]);
    setIsCreating(false);
  };

  if (isCreating) {
    return (
      <div className="interactions-section">
        <div className="section-header">
          <h3 className="section-title">💬 Interactions ({interactions?.length || 0})</h3>
          <div className="header-actions">
            <button className="save-button" onClick={handleCreateInteraction}>
              💾 Create Interaction
            </button>
            <button className="cancel-button" onClick={handleCancel}>
              ❌ Cancel
            </button>
          </div>
        </div>

        {errors.length > 0 && (
          <div className="form-errors">
            {errors.map((error, index) => (
              <div key={index} className="error-message">{error}</div>
            ))}
          </div>
        )}

        <div className="form-content">
          <div className="form-row">
            <div className="form-col">
              <label className="form-label">Interaction Name *</label>
              <input
                type="text"
                className="form-input"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Enter interaction name"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-col">
              <label className="form-label">Description *</label>
              <textarea
                className="form-textarea"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Describe the interaction between characters, NPCs, or quests"
                rows={4}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="interactions-section">
      <div className="section-header">
        <div className="header-left">
          <button 
            className="collapse-button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            aria-label={isCollapsed ? "Expand interactions section" : "Collapse interactions section"}
          >
            {isCollapsed ? "▶️" : "▼"}
          </button>
          <h3 className="section-title">💬 Interactions ({interactions?.length || 0})</h3>
        </div>
        <div className="header-actions">
          <button className="add-button" onClick={() => setIsCreating(true)}>
            ➕ Add Interaction
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <div className="interactions-content">
          {!interactions || interactions.length === 0 ? (
            <div className="empty-state">
              <p>No interactions yet. Add interactions to track character relationships and story events.</p>
              <div className="interaction-suggestions">
                <div className="suggestion-item">
                  <span className="suggestion-icon">👥</span>
                  <span className="suggestion-text">Character Meeting</span>
                </div>
                <div className="suggestion-item">
                  <span className="suggestion-icon">⚔️</span>
                  <span className="suggestion-text">Combat Encounter</span>
                </div>
                <div className="suggestion-item">
                  <span className="suggestion-icon">🤝</span>
                  <span className="suggestion-text">Negotiation</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="interactions-list">
              {interactions.map((interaction) => {
                const isLinked = interaction.campaignId === campaignId;
                return (
                  <div 
                    key={interaction._id} 
                    className="interaction-item"
                    onClick={() => handleInteractionClick(interaction._id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="interaction-header">
                      <h4 className="interaction-name">{interaction.name}</h4>
                      <div className="interaction-meta">
                        <span className="interaction-date">
                          {new Date(interaction.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="interaction-description">
                      {interaction.description}
                    </div>
                    <div className="interaction-participants">
                      {interaction.playerCharacterIds && interaction.playerCharacterIds.length > 0 && (
                        <span className="participant-badge">
                          👥 {interaction.playerCharacterIds.length} Characters
                        </span>
                      )}
                      {interaction.npcIds && interaction.npcIds.length > 0 && (
                        <span className="participant-badge">
                          🎭 {interaction.npcIds.length} NPCs
                        </span>
                      )}
                      {interaction.monsterIds && interaction.monsterIds.length > 0 && (
                        <span className="participant-badge">
                          🐉 {interaction.monsterIds.length} Monsters
                        </span>
                      )}
                    </div>
                    <div className="interaction-actions">
                      <div className="interaction-link-actions">
                        {isLinked ? (
                          <button
                            className="unlink-button"
                            onClick={(e) => handleLinkAction(e, interaction._id, true)}
                          >
                            Unlink
                          </button>
                        ) : (
                          <button
                            className="link-button"
                            onClick={(e) => handleLinkAction(e, interaction._id, false)}
                          >
                            Link
                          </button>
                        )}
                      </div>
                      <div className="view-details-hint">
                        <span className="hint-text">Click to view details →</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default InteractionsSection; 