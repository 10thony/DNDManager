import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { useUser } from "@clerk/clerk-react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import "./TimelineSection.css";

interface TimelineSectionProps {
  campaignId: Id<"campaigns">;
  timelineEventIds?: Id<"timelineEvents">[];
  onUpdate: () => void;
}

const TimelineSection: React.FC<TimelineSectionProps> = ({
  campaignId,
  timelineEventIds = [],
  onUpdate,
}) => {
  const { user } = useUser();
  const [isCreating, setIsCreating] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: new Date().getTime(),
    type: "Custom" as const,
  });
  const [errors, setErrors] = useState<string[]>([]);

  const timelineEvents = useQuery(api.timelineEvents.getAllTimelineEvents);
  const createTimelineEvent = useMutation(api.timelineEvents.createTimelineEvent);
  const addTimelineEventToCampaign = useMutation(api.campaigns.addTimelineEventToCampaign);

  const campaignTimelineEvents = timelineEvents?.filter(event => 
    timelineEventIds.includes(event._id)
  ) || [];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = (): boolean => {
    const newErrors: string[] = [];
    
    if (!formData.title.trim()) {
      newErrors.push("Event title is required");
    }
    
    if (!formData.description.trim()) {
      newErrors.push("Event description is required");
    }
    
    if (campaignTimelineEvents.length >= 3) {
      newErrors.push("Maximum of 3 timeline events allowed");
    }
    
    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleCreateEvent = async () => {
    if (!validateForm()) return;

    try {
      const eventId = await createTimelineEvent({
        campaignId,
        title: formData.title,
        description: formData.description,
        date: formData.date,
        type: formData.type,
        clerkId: user!.id,
      });

      await addTimelineEventToCampaign({
        campaignId,
        timelineEventId: eventId,
      });

      setFormData({
        title: "",
        description: "",
        date: new Date().getTime(),
        type: "Custom",
      });
      setErrors([]);
      setIsCreating(false);
      onUpdate();
    } catch (error) {
      console.error("Error creating timeline event:", error);
      setErrors(["Failed to create timeline event. Please try again."]);
    }
  };

  const handleCancel = () => {
    setFormData({
      title: "",
      description: "",
      date: new Date().getTime(),
      type: "Custom",
    });
    setErrors([]);
    setIsCreating(false);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case "Battle": return "⚔️";
      case "Alliance": return "🤝";
      case "Discovery": return "🔍";
      case "Disaster": return "💥";
      case "Political": return "🏛️";
      case "Cultural": return "🎭";
      default: return "📅";
    }
  };

  if (isCreating) {
    return (
      <div className="timeline-section">
        <div className="section-header">
          <h3 className="section-title">📅 Timeline Events ({campaignTimelineEvents.length}/3)</h3>
          <div className="header-actions">
            <button className="save-button" onClick={handleCreateEvent}>
              💾 Create Event
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
              <label className="form-label">Event Title *</label>
              <input
                type="text"
                className="form-input"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="Enter event title"
              />
            </div>
            <div className="form-col">
              <label className="form-label">Event Type</label>
              <select
                className="form-select"
                value={formData.type}
                onChange={(e) => handleInputChange("type", e.target.value)}
              >
                <option value="Custom">Custom</option>
                <option value="Battle">Battle</option>
                <option value="Alliance">Alliance</option>
                <option value="Discovery">Discovery</option>
                <option value="Disaster">Disaster</option>
                <option value="Political">Political</option>
                <option value="Cultural">Cultural</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-col">
              <label className="form-label">Date</label>
              <input
                type="date"
                className="form-input"
                value={new Date(formData.date).toISOString().split('T')[0]}
                onChange={(e) => handleInputChange("date", new Date(e.target.value).getTime())}
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
                placeholder="Enter event description"
                rows={3}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="timeline-section">
      <div className="section-header">
        <div className="header-left">
          <button 
            className="collapse-button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            aria-label={isCollapsed ? "Expand timeline section" : "Collapse timeline section"}
          >
            {isCollapsed ? "▶️" : "▼"}
          </button>
          <h3 className="section-title">📅 Timeline Events ({campaignTimelineEvents.length}/3)</h3>
        </div>
        <div className="header-actions">
          {campaignTimelineEvents.length < 3 && (
            <button className="add-button" onClick={() => setIsCreating(true)}>
              ➕ Add Event
            </button>
          )}
        </div>
      </div>

      {!isCollapsed && (
        <div className="timeline-content">
          {campaignTimelineEvents.length === 0 ? (
            <div className="empty-state">
              <p>No timeline events yet. Add up to 3 key events for your campaign.</p>
              <div className="event-suggestions">
                <div className="suggestion-item">
                  <span className="suggestion-icon">⚔️</span>
                  <span className="suggestion-text">Start Event</span>
                </div>
                <div className="suggestion-item">
                  <span className="suggestion-icon">🔍</span>
                  <span className="suggestion-text">Midpoint Event</span>
                </div>
                <div className="suggestion-item">
                  <span className="suggestion-icon">🏆</span>
                  <span className="suggestion-text">End Event</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="timeline-events">
              {campaignTimelineEvents.map((event, index) => (
                <div key={event._id} className="timeline-event">
                  <div className="event-header">
                    <div className="event-icon">
                      {getEventTypeIcon(event.type || "Custom")}
                    </div>
                    <div className="event-info">
                      <h4 className="event-title">{event.title}</h4>
                      <div className="event-meta">
                        <span className="event-type">{event.type || "Custom"}</span>
                        <span className="event-date">{formatDate(event.date)}</span>
                      </div>
                    </div>
                    <div className="event-number">{index + 1}</div>
                  </div>
                  <div className="event-description">
                    {event.description}
                  </div>
                </div>
              ))}
            </div>
          )}

          {campaignTimelineEvents.length === 3 && (
            <div className="completion-notice">
              ✅ Timeline complete! You have all 3 required events.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TimelineSection; 