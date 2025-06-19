import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import ActionCreationForm from "./ActionCreationForm";
import "./ActionsList.css";

const ActionsList: React.FC = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [editingAction, setEditingAction] = useState<Id<"actions"> | null>(null);
  const [isDeleting, setIsDeleting] = useState<Id<"actions"> | null>(null);
  const actions = useQuery(api.actions.getAllActions);
  const deleteAction = useMutation(api.actions.deleteAction);

  const handleDelete = async (id: Id<"actions">) => {
    if (window.confirm("Are you sure you want to delete this action? This action cannot be undone.")) {
      setIsDeleting(id);
      try {
        await deleteAction({ id });
      } catch (error) {
        console.error("Error deleting action:", error);
        alert("Failed to delete action. Please try again.");
      } finally {
        setIsDeleting(null);
      }
    }
  };

  const handleEdit = (id: Id<"actions">) => {
    setEditingAction(id);
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingAction(null);
  };

  const handleSubmitSuccess = () => {
    setIsCreating(false);
    setEditingAction(null);
  };

  if (!actions) {
    return (
      <div className="actions-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading actions...</p>
        </div>
      </div>
    );
  }

  if (isCreating || editingAction) {
    return (
      <div className="actions-container">
        <ActionCreationForm
          onSubmitSuccess={handleSubmitSuccess}
          onCancel={handleCancel}
          editingActionId={editingAction}
        />
      </div>
    );
  }

  return (
    <div className="actions-container">
      <div className="actions-header">
        <div className="header-content">
          <h2 className="actions-title">Actions</h2>
          <p className="actions-subtitle">
            Manage and organize all available actions for your characters
          </p>
        </div>
        <button
          className="create-button"
          onClick={() => setIsCreating(true)}
        >
          <span className="button-icon">+</span>
          Create New Action
        </button>
      </div>

      {actions.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">⚔️</div>
          <h3>No Actions Yet</h3>
          <p>Get started by creating your first action for your characters.</p>
          <button
            className="create-button"
            onClick={() => setIsCreating(true)}
          >
            Create Your First Action
          </button>
        </div>
      ) : (
        <div className="actions-grid">
          {actions.map((action) => (
            <div key={action._id} className="action-card">
              <div className="action-header">
                <div className="action-title-section">
                  <h3 className="action-name">{action.name}</h3>
                  <div className="action-type-badge">{action.type.replace(/_/g, ' ')}</div>
                </div>
                <div className="action-cost-badge">{action.actionCost}</div>
              </div>
              
              <p className="action-description">
                {action.description.length > 150 
                  ? `${action.description.substring(0, 150)}...` 
                  : action.description
                }
              </p>
              
              <div className="action-details">
                <div className="action-meta">
                  <span className="source-book">📖 {action.sourceBook}</span>
                  {action.requiresConcentration && (
                    <span className="concentration-badge">🧠 Concentration</span>
                  )}
                </div>
                
                {action.type === "SPELL" && action.spellLevel !== undefined && (
                  <div className="spell-info">
                    <span className="spell-level">
                      {action.spellLevel === 0 ? "Cantrip" : `Level ${action.spellLevel}`}
                    </span>
                  </div>
                )}
                
                {action.type === "CLASS_FEATURE" && action.className && (
                  <div className="class-info">
                    <span className="class-name">{action.className}</span>
                  </div>
                )}
              </div>
              
              <div className="action-actions">
                <button
                  className="edit-button"
                  onClick={() => handleEdit(action._id)}
                  title="Edit this action"
                >
                  ✏️ Edit
                </button>
                <button
                  className="delete-button"
                  onClick={() => handleDelete(action._id)}
                  disabled={isDeleting === action._id}
                  title="Delete this action"
                >
                  {isDeleting === action._id ? "🗑️ Deleting..." : "🗑️ Delete"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActionsList; 