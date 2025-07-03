import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { useNavigate } from "react-router-dom";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import "./FactionList.css";

const FactionList: React.FC = () => {
  const navigate = useNavigate();
  const factions = useQuery(api.factions.getFactions, {});
  const deleteFaction = useMutation(api.factions.deleteFaction);
  const [isDeleting, setIsDeleting] = useState<Id<"factions"> | null>(null);

  const handleCreateFaction = () => {
    navigate("/factions/new");
  };

  const handleViewFaction = (factionId: Id<"factions">) => {
    navigate(`/factions/${factionId}`);
  };

  const handleEditFaction = (factionId: Id<"factions">) => {
    navigate(`/factions/${factionId}/edit`);
  };

  const handleDeleteFaction = async (factionId: Id<"factions">) => {
    if (window.confirm("Are you sure you want to delete this faction?")) {
      setIsDeleting(factionId);
      try {
        await deleteFaction({ factionId });
      } catch (error) {
        console.error("Error deleting faction:", error);
        alert("Failed to delete faction");
      } finally {
        setIsDeleting(null);
      }
    }
  };

  if (factions === undefined) {
    return (
      <div className="factions-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading factions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="factions-container">
      <div className="factions-header">
        <div className="header-content">
          <h1 className="factions-title">Factions</h1>
          <p className="factions-subtitle">
            Manage the factions and organizations in your campaign world
          </p>
        </div>
        <button onClick={handleCreateFaction} className="create-button">
          <span className="button-icon">+</span>
          Create Faction
        </button>
      </div>

      {factions.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🏛️</div>
          <h3>No Factions Yet</h3>
          <p>Create your first faction to get started with managing organizations in your campaign.</p>
          <button onClick={handleCreateFaction} className="create-button">
            <span className="button-icon">+</span>
            Create Your First Faction
          </button>
        </div>
      ) : (
        <div className="factions-grid">
          {factions.map((faction) => (
            <div key={faction._id} className="faction-card">
              <div className="faction-header">
                <div className="faction-title-section">
                  <h3 className="faction-name">{faction.name}</h3>
                  <div className="faction-meta">
                    {faction.leaders && faction.leaders.length > 0 && (
                      <span className="leader-count">
                        {faction.leaders.length} Leader{faction.leaders.length !== 1 ? 's' : ''}
                      </span>
                    )}
                    {faction.allies && faction.allies.length > 0 && (
                      <span className="ally-count">
                        {faction.allies.length} Allied Faction{faction.allies.length !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <p className="faction-description">
                {faction.description.length > 150
                  ? `${faction.description.substring(0, 150)}...`
                  : faction.description}
              </p>

              {faction.goals && faction.goals.length > 0 && (
                <div className="faction-goals">
                  <strong>Goals:</strong>
                  <ul>
                    {faction.goals.slice(0, 2).map((goal, index) => (
                      <li key={index}>{goal}</li>
                    ))}
                    {faction.goals.length > 2 && (
                      <li>...and {faction.goals.length - 2} more</li>
                    )}
                  </ul>
                </div>
              )}

              <div className="faction-actions">
                <button
                  onClick={() => handleViewFaction(faction._id)}
                  className="view-button"
                >
                  View Details
                </button>
                <button
                  onClick={() => handleEditFaction(faction._id)}
                  className="edit-button"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteFaction(faction._id)}
                  className="delete-button"
                  disabled={isDeleting === faction._id}
                >
                  {isDeleting === faction._id ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FactionList; 