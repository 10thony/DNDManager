import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { useNavigate } from "react-router-dom";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import QuestForm from "./QuestForm";
import "./QuestList.css";

const QuestList: React.FC = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [editingQuest, setEditingQuest] = useState<Id<"quests"> | null>(null);
  const [isDeleting, setIsDeleting] = useState<Id<"quests"> | null>(null);
  
  const quests = useQuery(api.quests.getAllQuests);
  const deleteQuest = useMutation(api.quests.deleteQuest);
  const navigate = useNavigate();

  const handleDelete = async (id: Id<"quests">) => {
    if (window.confirm("Are you sure you want to delete this quest? This action cannot be undone.")) {
      setIsDeleting(id);
      try {
        await deleteQuest({ id });
      } catch (error) {
        console.error("Error deleting quest:", error);
        alert("Failed to delete quest. Please try again.");
      } finally {
        setIsDeleting(null);
      }
    }
  };

  const handleEdit = (id: Id<"quests">) => {
    setEditingQuest(id);
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingQuest(null);
  };

  const handleSubmitSuccess = () => {
    setIsCreating(false);
    setEditingQuest(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "NotStarted":
        return "status-not-started";
      case "InProgress":
        return "status-in-progress";
      case "Completed":
        return "status-completed";
      case "Failed":
        return "status-failed";
      default:
        return "status-unknown";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "NotStarted":
        return "Not Started";
      case "InProgress":
        return "In Progress";
      case "Completed":
        return "Completed";
      case "Failed":
        return "Failed";
      default:
        return status;
    }
  };

  if (!quests) {
    return (
      <div className="quest-list">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading quests...</p>
        </div>
      </div>
    );
  }

  if (isCreating || editingQuest) {
    return (
      <div className="quest-list">
        <QuestForm
          onSubmitSuccess={handleSubmitSuccess}
          onCancel={handleCancel}
          editingQuestId={editingQuest}
        />
      </div>
    );
  }

  return (
    <div className="quest-list">
      <div className="quest-list-header">
        <div className="header-content">
          <h1>Quests</h1>
          <p className="quests-subtitle">
            Manage and organize all your quests and adventures
          </p>
        </div>
        <button
          className="create-quest-btn"
          onClick={() => setIsCreating(true)}
        >
          <span className="button-icon">+</span>
          Create New Quest
        </button>
      </div>

      {quests.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🗺️</div>
          <h3>No Quests Yet</h3>
          <p>Get started by creating your first quest for your adventures.</p>
          <button
            className="create-quest-btn"
            onClick={() => setIsCreating(true)}
          >
            Create Your First Quest
          </button>
        </div>
      ) : (
        <div className="quests-grid">
          {quests.map((quest) => (
            <div key={quest._id} className="quest-card">
              <div 
                className="quest-card-content"
                onClick={() => navigate(`/quests/${quest._id}`)}
              >
                <div className="quest-card-header">
                  <h3 className="quest-name">{quest.name}</h3>
                  <span className={`quest-status ${getStatusColor(quest.status)}`}>
                    {getStatusText(quest.status)}
                  </span>
                </div>
                
                {quest.description && (
                  <p className="quest-description">
                    {quest.description.length > 100
                      ? `${quest.description.substring(0, 100)}...`
                      : quest.description}
                  </p>
                )}
                
                <div className="quest-meta">
                  <span className="quest-tasks">
                    {quest.taskIds.length} task{quest.taskIds.length !== 1 ? 's' : ''}
                  </span>
                  <span className="quest-date">
                    {new Date(quest.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="quest-actions">
                <button
                  className="edit-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(quest._id);
                  }}
                  title="Edit this quest"
                >
                  ✏️ Edit
                </button>
                <button
                  className="delete-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(quest._id);
                  }}
                  disabled={isDeleting === quest._id}
                  title="Delete this quest"
                >
                  {isDeleting === quest._id ? "🗑️ Deleting..." : "🗑️ Delete"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default QuestList; 