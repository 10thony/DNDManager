import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { useNavigate } from "react-router-dom";
import InteractionCreationForm from "./InteractionCreationForm";
import "./InteractionDetail.css";

interface InteractionDetailProps {
  interactionId: Id<"interactions">;
}

const InteractionDetail: React.FC<InteractionDetailProps> = ({ interactionId }) => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const interaction = useQuery(api.interactions.getInteractionById, { id: interactionId });
  const deleteInteraction = useMutation(api.interactions.deleteInteraction);
  
  const quest = useQuery(
    api.quests.getQuestById,
    interaction?.questId ? { questId: interaction.questId } : "skip"
  );
  
  const questTask = useQuery(
    api.questTasks.getQuestTaskById,
    interaction?.questTaskId ? { questTaskId: interaction.questTaskId } : "skip"
  );
  
  const playerCharacters = useQuery(api.playerCharacters.getAllPlayerCharacters);
  const npcs = useQuery(api.npcs.getAllNpcs);

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this interaction? This action cannot be undone.")) {
      setIsDeleting(true);
      try {
        await deleteInteraction({ id: interactionId });
        navigate("/interactions");
      } catch (error) {
        console.error("Error deleting interaction:", error);
        alert("Failed to delete interaction. Please try again.");
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleSubmitSuccess = () => {
    setIsEditing(false);
  };

  if (!interaction) {
    return (
      <div className="interaction-detail-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading interaction details...</p>
        </div>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="interaction-detail-container">
        <InteractionCreationForm
          onSubmitSuccess={handleSubmitSuccess}
          onCancel={handleCancel}
          editingInteractionId={interactionId}
        />
      </div>
    );
  }

  const participantCharacters = playerCharacters?.filter(char => 
    interaction.playerCharacterIds?.includes(char._id)
  ) || [];

  const participantNpcs = npcs?.filter(npc => 
    interaction.npcIds?.includes(npc._id)
  ) || [];

  return (
    <div className="interaction-detail-container">
      <div className="detail-header">
        <div>
          <h1 className="interaction-title">{interaction.name}</h1>
          <div className="interaction-meta">
            <div className="meta-item">
              <span className="meta-icon">📅</span>
              <span>Created {new Date(interaction.createdAt).toLocaleDateString()}</span>
            </div>
            {quest && (
              <div className="meta-item">
                <span className="meta-icon">📜</span>
                <span>Linked to Quest</span>
              </div>
            )}
            {questTask && (
              <div className="meta-item">
                <span className="meta-icon">✅</span>
                <span>Linked to Task</span>
              </div>
            )}
          </div>
        </div>
        <button className="back-button" onClick={() => navigate("/interactions")}>
          ← Back to Interactions
        </button>
      </div>

      {interaction.description && (
        <div className="interaction-description">
          <h3 className="description-title">Description</h3>
          <p className="description-content">{interaction.description}</p>
        </div>
      )}

      <div className="interaction-sections">
        <div className="section">
          <h3 className="section-title">Player Characters ({participantCharacters.length})</h3>
          {participantCharacters.length > 0 ? (
            <ul className="participants-list">
              {participantCharacters.map((character) => (
                <li key={character._id} className="participant-item">
                  <span className="participant-icon">👤</span>
                  <span className="participant-name">{character.name}</span>
                  <span className="participant-type">Character</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="empty-section">
              <div className="empty-icon">👤</div>
              <p>No player characters involved</p>
            </div>
          )}
        </div>

        <div className="section">
          <h3 className="section-title">NPCs ({participantNpcs.length})</h3>
          {participantNpcs.length > 0 ? (
            <ul className="participants-list">
              {participantNpcs.map((npc) => (
                <li key={npc._id} className="participant-item">
                  <span className="participant-icon">🎭</span>
                  <span className="participant-name">{npc.name}</span>
                  <span className="participant-type">NPC</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="empty-section">
              <div className="empty-icon">🎭</div>
              <p>No NPCs involved</p>
            </div>
          )}
        </div>
      </div>

      {(quest || questTask) && (
        <div className="interaction-sections">
          {quest && (
            <div className="section">
              <h3 className="section-title">Associated Quest</h3>
              <a href={`/quests/${quest._id}`} className="quest-link">
                📜 {quest.name}
              </a>
            </div>
          )}
          
          {questTask && (
            <div className="section">
              <h3 className="section-title">Associated Quest Task</h3>
              <div className="quest-link">
                ✅ {questTask.title}
              </div>
              {questTask.description && (
                <p className="description-content" style={{ marginTop: '0.5rem' }}>
                  {questTask.description}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      <div className="action-buttons">
        <button
          className="edit-button"
          onClick={handleEdit}
          disabled={isDeleting}
        >
          ✏️ Edit Interaction
        </button>
        <button
          className="delete-button"
          onClick={handleDelete}
          disabled={isDeleting}
        >
          {isDeleting ? "🗑️ Deleting..." : "🗑️ Delete Interaction"}
        </button>
      </div>
    </div>
  );
};

export default InteractionDetail; 