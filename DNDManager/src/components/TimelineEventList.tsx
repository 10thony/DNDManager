import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { useNavigate } from "react-router-dom";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import TimelineEventCreationForm from "./TimelineEventCreationForm";
import "./TimelineEventList.css";

const TimelineEventList: React.FC = () => {
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = useState(false);
  const [editingTimelineEvent, setEditingTimelineEvent] = useState<Id<"timelineEvents"> | null>(null);
  const [isDeleting, setIsDeleting] = useState<Id<"timelineEvents"> | null>(null);
  const timelineEvents = useQuery(api.timelineEvents.getAllTimelineEvents);
  const deleteTimelineEvent = useMutation(api.timelineEvents.deleteTimelineEvent);

  const handleDelete = async (id: Id<"timelineEvents">, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    if (window.confirm("Are you sure you want to delete this timeline event? This action cannot be undone.")) {
      setIsDeleting(id);
      try {
        await deleteTimelineEvent({ id });
      } catch (error) {
        console.error("Error deleting timeline event:", error);
        alert("Failed to delete timeline event. Please try again.");
      } finally {
        setIsDeleting(null);
      }
    }
  };

  const handleEdit = (id: Id<"timelineEvents">, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    setEditingTimelineEvent(id);
  };

  const handleCardClick = (id: Id<"timelineEvents">) => {
    navigate(`/timeline-events/${id}`);
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingTimelineEvent(null);
  };

  const handleSubmitSuccess = () => {
    setIsCreating(false);
    setEditingTimelineEvent(null);
  };

  if (!timelineEvents) {
    return (
      <div className="timeline-events-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading timeline events...</p>
        </div>
      </div>
    );
  }

  if (isCreating || editingTimelineEvent) {
    return (
      <div className="timeline-events-container">
        <TimelineEventCreationForm
          onSubmitSuccess={handleSubmitSuccess}
          onCancel={handleCancel}
          editingTimelineEventId={editingTimelineEvent}
        />
      </div>
    );
  }

  return (
    <div className="timeline-events-container">
      <div className="timeline-events-header">
        <div className="header-content">
          <h2 className="timeline-events-title">Timeline Events</h2>
          <p className="timeline-events-subtitle">
            Manage and organize important events in your campaign timeline
          </p>
        </div>
        <button
          className="create-button"
          onClick={() => setIsCreating(true)}
        >
          <span className="button-icon">+</span>
          Create New Timeline Event
        </button>
      </div>

      {timelineEvents.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📅</div>
          <h3>No Timeline Events Yet</h3>
          <p>Get started by creating your first timeline event for your campaign.</p>
          <button
            className="create-button"
            onClick={() => setIsCreating(true)}
          >
            Create Your First Timeline Event
          </button>
        </div>
      ) : (
        <div className="timeline-events-grid">
          {timelineEvents.map((timelineEvent) => (
            <div 
              key={timelineEvent._id} 
              className="timeline-event-card"
              onClick={() => handleCardClick(timelineEvent._id)}
              style={{ cursor: 'pointer' }}
            >
              <div className="timeline-event-header">
                <div className="timeline-event-title-section">
                  <h3 className="timeline-event-name">{timelineEvent.title}</h3>
                  <div className="timeline-event-type-badge">{timelineEvent.type || "Custom"}</div>
                </div>
              </div>
              
              <p className="timeline-event-description">
                {timelineEvent.description.length > 150 
                  ? `${timelineEvent.description.substring(0, 150)}...` 
                  : timelineEvent.description
                }
              </p>
              
              <div className="timeline-event-details">
                <div className="timeline-event-meta">
                  <span className="event-date">
                    📅 {new Date(timelineEvent.date).toLocaleDateString()}
                  </span>
                  {timelineEvent.relatedQuestIds && timelineEvent.relatedQuestIds.length > 0 && (
                    <span className="quest-link">📜 {timelineEvent.relatedQuestIds.length} Quests</span>
                  )}
                </div>
                
                <div className="related-entities-info">
                  <span className="related-count">
                    🗺️ {timelineEvent.relatedLocationIds?.length || 0} Locations
                  </span>
                  <span className="related-count">
                    🎭 {timelineEvent.relatedNpcIds?.length || 0} NPCs
                  </span>
                  <span className="related-count">
                    🏛️ {timelineEvent.relatedFactionIds?.length || 0} Factions
                  </span>
                </div>
              </div>
              
              <div className="timeline-event-actions">
                <button
                  className="edit-button"
                  onClick={(e) => handleEdit(timelineEvent._id, e)}
                  title="Edit this timeline event"
                >
                  ✏️ Edit
                </button>
                <button
                  className="delete-button"
                  onClick={(e) => handleDelete(timelineEvent._id, e)}
                  disabled={isDeleting === timelineEvent._id}
                  title="Delete this timeline event"
                >
                  {isDeleting === timelineEvent._id ? "🗑️ Deleting..." : "🗑️ Delete"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TimelineEventList; 