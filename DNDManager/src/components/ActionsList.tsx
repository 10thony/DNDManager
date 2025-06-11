import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import ActionCreationForm from "./ActionCreationForm";
import "./ActionsList.css";

const ActionsList: React.FC = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [editingAction, setEditingAction] = useState<Id<"actions"> | null>(null);
  const actions = useQuery(api.actions.getAllActions);
  const deleteAction = useMutation(api.actions.deleteAction);

  const handleDelete = async (id: Id<"actions">) => {
    if (window.confirm("Are you sure you want to delete this action?")) {
      try {
        await deleteAction({ id });
      } catch (error) {
        console.error("Error deleting action:", error);
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
    return <div>Loading...</div>;
  }

  if (isCreating || editingAction) {
    return (
      <div className="actions-container">
        <h2>{editingAction ? "Edit Action" : "Create New Action"}</h2>
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
        <h2>Actions</h2>
        <button
          className="create-button"
          onClick={() => setIsCreating(true)}
        >
          Create New Action
        </button>
      </div>

      <div className="actions-grid">
        {actions.map((action) => (
          <div key={action._id} className="action-card">
            <div className="action-header">
              <h3>{action.name}</h3>
              <div className="action-type">{action.type}</div>
            </div>
            <p className="action-description">{action.description}</p>
            <div className="action-details">
              <span className="action-cost">{action.actionCost}</span>
              {action.requiresConcentration && (
                <span className="concentration-badge">Concentration</span>
              )}
            </div>
            <div className="action-actions">
              <button
                className="edit-button"
                onClick={() => handleEdit(action._id)}
              >
                Edit
              </button>
              <button
                className="delete-button"
                onClick={() => handleDelete(action._id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActionsList; 