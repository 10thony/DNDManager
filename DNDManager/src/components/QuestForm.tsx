import React, { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import "./QuestCreationForm.css";

interface QuestFormData {
  name: string;
  description: string;
  status: "NotStarted" | "InProgress" | "Completed" | "Failed";
  locationId?: Id<"locations">;
  requiredItemIds: Id<"items">[];
  involvedNpcIds: Id<"npcs">[];
  participantIds: Id<"playerCharacters">[];
  interactions: Id<"interactions">[];
  rewards: {
    xp?: number;
    gold?: number;
    itemIds?: Id<"items">[];
  };
}

interface QuestFormProps {
  onSubmitSuccess: () => void;
  onCancel: () => void;
  editingQuestId?: Id<"quests"> | null;
}

const QuestForm: React.FC<QuestFormProps> = ({
  onSubmitSuccess,
  onCancel,
  editingQuestId,
}) => {
  const navigate = useNavigate();
  const { user } = useUser();
  const createQuest = useMutation(api.quests.createQuest);
  const updateQuest = useMutation(api.quests.updateQuest);
  
  // Fetch related data
  const locations = useQuery(api.locations.list);
  const items = useQuery(api.items.getItems);
  const npcs = useQuery(api.locations.getNPCs);
  const characters = useQuery(api.characters.getAllCharacters);
  const interactions = useQuery(api.interactions.getAllInteractions);
  
  // Fetch quest data if editing
  const questData = editingQuestId 
    ? useQuery(api.quests.getQuestById, { id: editingQuestId })
    : null;

  const [formData, setFormData] = useState<QuestFormData>({
    name: "",
    description: "",
    status: "NotStarted",
    requiredItemIds: [],
    involvedNpcIds: [],
    participantIds: [],
    interactions: [],
    rewards: {},
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load quest data when editing
  useEffect(() => {
    if (questData && editingQuestId) {
      setFormData({
        name: questData.name || "",
        description: questData.description || "",
        status: questData.status,
        locationId: questData.locationId,
        requiredItemIds: questData.requiredItemIds || [],
        involvedNpcIds: questData.involvedNpcIds || [],
        participantIds: questData.participantIds || [],
        interactions: questData.interactions || [],
        rewards: questData.rewards || {},
      });
    }
  }, [questData, editingQuestId]);

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
    field: keyof QuestFormData,
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

  const handleRewardChange = (field: keyof QuestFormData["rewards"], value: any) => {
    setFormData((prev) => ({
      ...prev,
      rewards: {
        ...prev.rewards,
        [field]: value,
      },
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Quest name is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !user) {
      return;
    }

    setIsSubmitting(true);

    try {
      const questData = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        status: formData.status,
        locationId: formData.locationId,
        requiredItemIds: formData.requiredItemIds.length > 0 ? formData.requiredItemIds : undefined,
        involvedNpcIds: formData.involvedNpcIds.length > 0 ? formData.involvedNpcIds : undefined,
        participantIds: formData.participantIds.length > 0 ? formData.participantIds : undefined,
        interactions: formData.interactions.length > 0 ? formData.interactions : undefined,
        rewards: Object.keys(formData.rewards).length > 0 ? formData.rewards : undefined,
      };

      if (editingQuestId) {
        // Update existing quest
        await updateQuest({
          id: editingQuestId,
          ...questData,
        });
      } else {
        // Create new quest
        const questId = await createQuest({
          ...questData,
          creatorId: user.id,
          taskIds: [],
        });
        navigate(`/quests/${questId}`);
      }

      onSubmitSuccess();
    } catch (error) {
      console.error("Error saving quest:", error);
      setErrors({ submit: "Failed to save quest. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return <div className="loading">Loading user...</div>;
  }

  const isEditing = !!editingQuestId;

  return (
    <div className="quest-creation-form">
      <div className="form-header">
        <h1>{isEditing ? "Edit Quest" : "Create New Quest"}</h1>
        <button className="cancel-btn" onClick={onCancel}>
          Cancel
        </button>
      </div>

      <form onSubmit={handleSubmit} className="form">
        {/* Basic Information */}
        <div className="form-section">
          <h2>Basic Information</h2>

          <div className="form-group">
            <label htmlFor="name">Quest Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={errors.name ? "error" : ""}
              placeholder="Enter quest name"
            />
            {errors.name && <span className="error-message">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter quest description"
              rows={4}
            />
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

          <div className="form-group">
            <label htmlFor="locationId">Location</label>
            <select
              id="locationId"
              name="locationId"
              value={formData.locationId || ""}
              onChange={handleInputChange}
            >
              <option value="">Select a location (optional)</option>
              {locations?.map((location) => (
                <option key={location._id} value={location._id}>
                  {location.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Requirements */}
        <div className="form-section">
          <h2>Requirements</h2>

          <div className="form-group">
            <label>Required Items</label>
            <div className="multi-select">
              {items?.map((item) => (
                <label key={item._id} className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={formData.requiredItemIds.includes(item._id)}
                    onChange={() => handleMultiSelectChange("requiredItemIds", item._id)}
                  />
                  {item.name}
                </label>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Involved NPCs</label>
            <div className="multi-select">
              {npcs?.map((npc) => (
                <label key={npc._id} className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={formData.involvedNpcIds.includes(npc._id)}
                    onChange={() => handleMultiSelectChange("involvedNpcIds", npc._id)}
                  />
                  {npc.name}
                </label>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Participants</label>
            <div className="multi-select">
              {characters?.map((character) => (
                <label key={character._id} className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={formData.participantIds.includes(character._id)}
                    onChange={() => handleMultiSelectChange("participantIds", character._id)}
                  />
                  {character.name}
                </label>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Interactions</label>
            <div className="multi-select">
              {interactions?.map((interaction) => (
                <label key={interaction._id} className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={formData.interactions.includes(interaction._id)}
                    onChange={() => handleMultiSelectChange("interactions", interaction._id)}
                  />
                  {interaction.name}
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Rewards */}
        <div className="form-section">
          <h2>Rewards</h2>

          <div className="form-group">
            <label htmlFor="xp">Experience Points</label>
            <input
              type="number"
              id="xp"
              name="xp"
              value={formData.rewards.xp || ""}
              onChange={(e) => handleRewardChange("xp", e.target.value === "" ? undefined : Number(e.target.value))}
              placeholder="Enter XP reward"
              min="0"
            />
          </div>

          <div className="form-group">
            <label htmlFor="gold">Gold</label>
            <input
              type="number"
              id="gold"
              name="gold"
              value={formData.rewards.gold || ""}
              onChange={(e) => handleRewardChange("gold", e.target.value === "" ? undefined : Number(e.target.value))}
              placeholder="Enter gold reward"
              min="0"
            />
          </div>

          <div className="form-group">
            <label>Item Rewards</label>
            <div className="multi-select">
              {items?.map((item) => (
                <label key={item._id} className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={formData.rewards.itemIds?.includes(item._id) || false}
                    onChange={() => {
                      const currentItemIds = formData.rewards.itemIds || [];
                      const newItemIds = currentItemIds.includes(item._id)
                        ? currentItemIds.filter((id) => id !== item._id)
                        : [...currentItemIds, item._id];
                      handleRewardChange("itemIds", newItemIds);
                    }}
                  />
                  {item.name}
                </label>
              ))}
            </div>
          </div>
        </div>

        {errors.submit && (
          <div className="error-message">{errors.submit}</div>
        )}

        <div className="form-actions">
          <button
            type="submit"
            className="submit-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : (isEditing ? "Update Quest" : "Create Quest")}
          </button>
        </div>
      </form>
    </div>
  );
};

export default QuestForm; 