import React, { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { useUser } from "@clerk/clerk-react";
import "./TimelineEventCreationForm.css";

interface TimelineEventCreationFormProps {
  onSubmitSuccess: () => void;
  onCancel: () => void;
  editingTimelineEventId?: Id<"timelineEvents"> | null;
}

const TimelineEventCreationForm: React.FC<TimelineEventCreationFormProps> = ({
  onSubmitSuccess,
  onCancel,
  editingTimelineEventId,
}) => {
  const { user } = useUser();
  const createTimelineEvent = useMutation(api.timelineEvents.createTimelineEvent);
  const updateTimelineEvent = useMutation(api.timelineEvents.updateTimelineEvent);
  const timelineEvent = useQuery(
    api.timelineEvents.getTimelineEventById,
    editingTimelineEventId ? { id: editingTimelineEventId } : "skip"
  );
  const campaigns = useQuery(api.campaigns.getAllCampaigns, { clerkId: user?.id });

  const [formData, setFormData] = useState({
    campaignId: "",
    title: "",
    description: "",
    date: new Date().toISOString().split('T')[0],
    type: "Custom" as "Battle" | "Alliance" | "Discovery" | "Disaster" | "Political" | "Cultural" | "Custom",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (timelineEvent) {
      setFormData({
        campaignId: timelineEvent.campaignId,
        title: timelineEvent.title,
        description: timelineEvent.description,
        date: new Date(timelineEvent.date).toISOString().split('T')[0],
        type: timelineEvent.type || "Custom",
      });
    }
  }, [timelineEvent]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (!formData.campaignId) {
      newErrors.campaignId = "Campaign is required";
    }

    if (!formData.date) {
      newErrors.date = "Date is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!user) {
      setErrors({ general: "User not authenticated" });
      return;
    }

    setIsSubmitting(true);

    try {
      const timelineEventData = {
        campaignId: formData.campaignId as Id<"campaigns">,
        title: formData.title.trim(),
        description: formData.description.trim(),
        date: new Date(formData.date).getTime(),
        type: formData.type,
      };

      if (editingTimelineEventId) {
        await updateTimelineEvent({
          id: editingTimelineEventId,
          ...timelineEventData,
        });
      } else {
        await createTimelineEvent({
          ...timelineEventData,
          clerkId: user.id,
        });
      }

      onSubmitSuccess();
    } catch (error) {
      console.error("Error saving timeline event:", error);
      setErrors({ general: "Failed to save timeline event. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <div className="timeline-event-form">
      <div className="form-header">
        <h2 className="form-section-title">
          {editingTimelineEventId ? "Edit Timeline Event" : "Create New Timeline Event"}
        </h2>
        <button className="back-button" onClick={onCancel}>
          ← Back
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-section">
          <h3 className="form-section-title">Basic Information</h3>
          
          <div className="form-row">
            <div className="form-col">
              <label className="form-label" htmlFor="title">
                Event Title *
              </label>
              <input
                type="text"
                id="title"
                className="form-input"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="Enter event title"
              />
              {errors.title && <div className="form-error">{errors.title}</div>}
            </div>

            <div className="form-col">
              <label className="form-label" htmlFor="type">
                Event Type
              </label>
              <select
                id="type"
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
              <label className="form-label" htmlFor="campaignId">
                Campaign *
              </label>
              <select
                id="campaignId"
                className="form-select"
                value={formData.campaignId}
                onChange={(e) => handleInputChange("campaignId", e.target.value)}
              >
                <option value="">Select a campaign</option>
                {campaigns?.map((campaign) => (
                  <option key={campaign._id} value={campaign._id}>
                    {campaign.name}
                  </option>
                ))}
              </select>
              {errors.campaignId && <div className="form-error">{errors.campaignId}</div>}
            </div>

            <div className="form-col">
              <label className="form-label" htmlFor="date">
                Event Date *
              </label>
              <input
                type="date"
                id="date"
                className="form-input"
                value={formData.date}
                onChange={(e) => handleInputChange("date", e.target.value)}
              />
              {errors.date && <div className="form-error">{errors.date}</div>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-col full-width">
              <label className="form-label" htmlFor="description">
                Description *
              </label>
              <textarea
                id="description"
                className="form-textarea"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Describe the timeline event..."
              />
              {errors.description && <div className="form-error">{errors.description}</div>}
            </div>
          </div>
        </div>

        {errors.general && <div className="form-error">{errors.general}</div>}

        <div className="form-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? editingTimelineEventId
                ? "Updating..."
                : "Creating..."
              : editingTimelineEventId
              ? "Update Timeline Event"
              : "Create Timeline Event"
            }
          </button>
        </div>
      </form>
    </div>
  );
};

export default TimelineEventCreationForm; 