import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { useNavigate } from "react-router-dom";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import InteractionCreationForm from "./InteractionCreationForm";
import { useUser } from "@clerk/clerk-react";
import "./InteractionList.css";

const InteractionList: React.FC = () => {
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = useState(false);
  const [editingInteraction, setEditingInteraction] = useState<Id<"interactions"> | null>(null);
  const [isDeleting, setIsDeleting] = useState<Id<"interactions"> | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { user } = useUser();
  const interactions = useQuery(api.interactions.getAllInteractions);
  const deleteInteraction = useMutation(api.interactions.deleteInteraction);
  const generateSampleInteractions = useMutation(api.interactions.generateSampleInteractions);

  const handleDelete = async (id: Id<"interactions">, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    if (window.confirm("Are you sure you want to delete this interaction? This action cannot be undone.")) {
      setIsDeleting(id);
      try {
        await deleteInteraction({ id });
      } catch (error) {
        console.error("Error deleting interaction:", error);
        alert("Failed to delete interaction. Please try again.");
      } finally {
        setIsDeleting(null);
      }
    }
  };

  const handleEdit = (id: Id<"interactions">, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    setEditingInteraction(id);
  };

  const handleCardClick = (id: Id<"interactions">) => {
    navigate(`/interactions/${id}`);
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingInteraction(null);
  };

  const handleSubmitSuccess = () => {
    setIsCreating(false);
    setEditingInteraction(null);
  };

  const handleGenerateSampleData = async () => {
    if (!user?.id) return;
    
    setIsGenerating(true);
    try {
      const result = await generateSampleInteractions({ clerkId: user.id });
      console.log("Sample interactions generated:", result);
      alert(`Successfully generated ${result.count} sample interactions!`);
    } catch (error) {
      console.error("Error generating sample interactions:", error);
      alert("Error generating sample interactions. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  if (!interactions) {
    return (
      <div className="interactions-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading interactions...</p>
        </div>
      </div>
    );
  }

  if (isCreating || editingInteraction) {
    return (
      <div className="interactions-container">
        <InteractionCreationForm
          onSubmitSuccess={handleSubmitSuccess}
          onCancel={handleCancel}
          editingInteractionId={editingInteraction}
        />
      </div>
    );
  }

  return (
    <div className="interactions-container">
      <div className="interactions-header">
        <div className="header-content">
          <h2 className="interactions-title">Interactions</h2>
          <p className="interactions-subtitle">
            Manage and organize all interactions between characters, NPCs, and quests
          </p>
        </div>
        <button
          className="create-button"
          onClick={() => setIsCreating(true)}
        >
          <span className="button-icon">+</span>
          Create New Interaction
        </button>
      </div>

      {interactions.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">💬</div>
          <h3>No Interactions Yet</h3>
          <p>Get started by creating your first interaction for your campaign.</p>
          <div className="empty-state-actions">
            <button
              className="create-button"
              onClick={() => setIsCreating(true)}
            >
              Create Your First Interaction
            </button>
            <button
              onClick={handleGenerateSampleData}
              disabled={isGenerating}
              className="btn btn-secondary"
              style={{ marginLeft: '10px' }}
            >
              {isGenerating ? "Generating..." : "Generate Sample Data"}
            </button>
          </div>
          <div className="admin-note">
            <p><em>You can generate sample interactions to get started quickly.</em></p>
          </div>
        </div>
      ) : (
        <div className="interactions-grid">
          {interactions.map((interaction) => (
            <div 
              key={interaction._id} 
              className="interaction-card"
              onClick={() => handleCardClick(interaction._id)}
              style={{ cursor: 'pointer' }}
            >
              <div className="interaction-header">
                <div className="interaction-title-section">
                  <h3 className="interaction-name">{interaction.name}</h3>
                  <div className="interaction-type-badge">Interaction</div>
                </div>
              </div>
              
              {interaction.description && (
                <p className="interaction-description">
                  {interaction.description.length > 150 
                    ? `${interaction.description.substring(0, 150)}...` 
                    : interaction.description
                  }
                </p>
              )}
              
              <div className="interaction-details">
                <div className="interaction-meta">
                  {interaction.questId && (
                    <span className="quest-link">📜 Linked to Quest</span>
                  )}
                  {interaction.questTaskId && (
                    <span className="quest-link">✅ Linked to Task</span>
                  )}
                </div>
                
                <div className="participants-info">
                  <span className="participants-count">
                    👥 {interaction.playerCharacterIds?.length || 0} Characters
                  </span>
                  <span className="participants-count">
                    🎭 {interaction.npcIds?.length || 0} NPCs
                  </span>
                </div>
              </div>
              
              <div className="interaction-actions">
                <button
                  className="edit-button"
                  onClick={(e) => handleEdit(interaction._id, e)}
                  title="Edit this interaction"
                >
                  ✏️ Edit
                </button>
                <button
                  className="delete-button"
                  onClick={(e) => handleDelete(interaction._id, e)}
                  disabled={isDeleting === interaction._id}
                  title="Delete this interaction"
                >
                  {isDeleting === interaction._id ? "🗑️ Deleting..." : "🗑️ Delete"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default InteractionList; 