import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { useNavigate } from "react-router-dom";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import MonsterForm from "./MonsterForm";
import "./MonsterList.css";

const MonsterList: React.FC = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [editingMonster, setEditingMonster] = useState<Id<"monsters"> | null>(null);
  const [isDeleting, setIsDeleting] = useState<Id<"monsters"> | null>(null);
  const navigate = useNavigate();
  const monsters = useQuery(api.monsters.getAllMonsters);
  const deleteMonster = useMutation(api.monsters.deleteMonster);

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
  };

  const handleSubmitSuccess = () => {
    setIsCreating(false);
    setEditingMonster(null);
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
          <p>Get started by creating your first monster for your campaigns.</p>
          <button
            className="create-button"
            onClick={() => setIsCreating(true)}
          >
            Create Your First Monster
          </button>
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