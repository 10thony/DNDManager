import React, { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { useNavigate, useParams } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import "./QuestTaskCreationForm.css";

interface QuestTaskFormData {
  title: string;
  description: string;
  type: "Fetch" | "Kill" | "Speak" | "Explore" | "Puzzle" | "Deliver" | "Escort" | "Custom";
  status: "NotStarted" | "InProgress" | "Completed" | "Failed";
  dependsOn: Id<"questTasks">[];
  assignedTo: Id<"playerCharacters">[];
  locationId?: Id<"locations">;
  targetNpcId?: Id<"npcs">;
  requiredItemIds: Id<"items">[];
  interactions: Id<"interactions">[];
}

const QuestTaskCreationForm: React.FC = () => {
  const navigate = useNavigate();
  const { questId } = useParams<{ questId: string }>();
  const { user } = useUser();
  const createQuestTask = useMutation(api.questTasks.createQuestTask);
  
  // Fetch related data
  const quest = useQuery(api.quests.getQuestById, { id: questId as Id<"quests"> });
  const locations = useQuery(api.locations.list);
  const items = useQuery(api.items.getItems);
  const npcs = useQuery(api.npcs.getAllNpcs);
  const characters = useQuery(api.characters.getAllCharacters);
  const interactions = useQuery(api.interactions.getAllInteractions);
  const existingTasks = useQuery(api.questTasks.getQuestTasksByQuest, { questId: questId as Id<"quests"> });

  const [formData, setFormData] = useState<QuestTaskFormData>({
    title: "",
    description: "",
    type: "Custom",
    status: "NotStarted",
    dependsOn: [],
    assignedTo: [],
    requiredItemIds: [],
    interactions: [],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleMultiSelectChange = (
    field: keyof QuestTaskFormData,
    value: Id<any>
  ) => {
    setFormData((prev) => {
      const currentArray = prev[field] as Id<any>[];
      const newArray = currentArray.includes(value)
        ? currentArray.filter((id) => id !== value)
        : [...currentArray, value];
      return {
        ...prev,
        [field]: newArray,
      };
    });
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Task title is required";
    }

    if (!questId) {
      newErrors.submit = "Quest ID is missing";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !user || !questId) {
      return;
    }

    setIsSubmitting(true);

    try {
      const taskData = {
        questId: questId as Id<"quests">,
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        type: formData.type,
        status: formData.status,
        dependsOn: formData.dependsOn.length > 0 ? formData.dependsOn : undefined,
        assignedTo: formData.assignedTo.length > 0 ? formData.assignedTo : undefined,
        locationId: formData.locationId,
        targetNpcId: formData.targetNpcId,
        requiredItemIds: formData.requiredItemIds.length > 0 ? formData.requiredItemIds : undefined,
        interactions: formData.interactions.length > 0 ? formData.interactions : undefined,
        clerkId: user.id,
      };

      await createQuestTask({
        ...taskData,
      });
      navigate(`/quests/${questId}`);
    } catch (error) {
      console.error("Error creating quest task:", error);
      setErrors({ submit: "Failed to create quest task. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate(`/quests/${questId}`);
  };

  if (!user || !questId) {
    return <div className="loading">Loading...</div>;
  }

  if (!quest) {
    return <div className="loading">Loading quest...</div>;
  }

  return (
    <div className="quest-task-creation-form">
      <div className="form-header">
        <div>
          <h1>Create New Quest Task</h1>
          <p className="quest-context">For quest: {quest.name}</p>
        </div>
        <button className="cancel-btn" onClick={handleCancel}>
          Cancel
        </button>
      </div>

      <form onSubmit={handleSubmit} className="form">
        {/* Basic Information */}
        <div className="form-section">
          <h2>Basic Information</h2>

          <div className="form-group">
            <label htmlFor="title">Task Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className={errors.title ? "error" : ""}
              placeholder="Enter task title"
            />
            {errors.title && <span className="error-message">{errors.title}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter task description"
              rows={4}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="type">Task Type</label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleInputChange}
              >
                <option value="Fetch">Fetch</option>
                <option value="Kill">Kill</option>
                <option value="Speak">Speak</option>
                <option value="Explore">Explore</option>
                <option value="Puzzle">Puzzle</option>
                <option value="Deliver">Deliver</option>
                <option value="Escort">Escort</option>
                <option value="Custom">Custom</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
              >
                <option value="NotStarted">Not Started</option>
                <option value="InProgress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Failed">Failed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Dependencies */}
        <div className="form-section">
          <h2>Dependencies</h2>
          <div className="form-group">
            <label>Depends On (Other Tasks)</label>
            <div className="checkbox-group">
              {existingTasks?.map((task: any) => (
                <label key={task._id} className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={formData.dependsOn.includes(task._id)}
                    onChange={() => handleMultiSelectChange("dependsOn", task._id)}
                  />
                  <span>{task.title}</span>
                </label>
              ))}
              {(!existingTasks || existingTasks.length === 0) && (
                <p className="no-items">No existing tasks to depend on</p>
              )}
            </div>
          </div>
        </div>

        {/* Assignment */}
        <div className="form-section">
          <h2>Assignment</h2>
          <div className="form-group">
            <label>Assigned To (Player Characters)</label>
            <div className="checkbox-group">
              {characters?.map((character: any) => (
                <label key={character._id} className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={formData.assignedTo.includes(character._id)}
                    onChange={() => handleMultiSelectChange("assignedTo", character._id)}
                  />
                  <span>{character.name}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Location and Target */}
        <div className="form-section">
          <h2>Location & Target</h2>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="locationId">Location</label>
              <select
                id="locationId"
                name="locationId"
                value={formData.locationId || ""}
                onChange={handleInputChange}
              >
                <option value="">No location</option>
                {locations?.map((location: any) => (
                  <option key={location._id} value={location._id}>
                    {location.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="targetNpcId">Target NPC</label>
              <select
                id="targetNpcId"
                name="targetNpcId"
                value={formData.targetNpcId || ""}
                onChange={handleInputChange}
              >
                <option value="">No target NPC</option>
                {npcs?.map((npc: any) => (
                  <option key={npc._id} value={npc._id}>
                    {npc.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Requirements */}
        <div className="form-section">
          <h2>Requirements</h2>
          <div className="form-group">
            <label>Required Items</label>
            <div className="checkbox-group">
              {items?.map((item: any) => (
                <label key={item._id} className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={formData.requiredItemIds.includes(item._id)}
                    onChange={() => handleMultiSelectChange("requiredItemIds", item._id)}
                  />
                  <span>{item.name}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Interactions */}
        <div className="form-section">
          <h2>Interactions</h2>
          <div className="form-group">
            <label>Related Interactions</label>
            <div className="checkbox-group">
              {interactions?.map((interaction: any) => (
                <label key={interaction._id} className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={formData.interactions.includes(interaction._id)}
                    onChange={() => handleMultiSelectChange("interactions", interaction._id)}
                  />
                  <span>{interaction.name}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {errors.submit && (
          <div className="error-message submit-error">{errors.submit}</div>
        )}

        <div className="form-actions">
          <button
            type="submit"
            className="submit-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating Task..." : "Create Task"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default QuestTaskCreationForm; 