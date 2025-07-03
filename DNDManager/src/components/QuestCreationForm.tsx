import React, { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { useNavigate, useSearchParams } from "react-router-dom";
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

const QuestCreationForm: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get('returnTo');
  const { user } = useUser();
  const createQuest = useMutation(api.quests.createQuest);
  
  // Fetch related data
  const locations = useQuery(api.locations.list);
  const items = useQuery(api.items.getItems);
  const npcs = useQuery(api.npcs.getAllNpcs);
  const characters = useQuery(api.characters.getAllCharacters);
  // const interactions = useQuery(api.interactions.getAllInteractions);

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

  // const handleNumberInputChange = (
  //   e: React.ChangeEvent<HTMLInputElement>
  // ) => {
  //   const { name, value } = e.target;
  //   const numValue = value === "" ? undefined : Number(value);
  //   setFormData((prev) => ({
  //     ...prev,
  //     [name]: numValue,
  //   }));
  // };

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
        taskIds: [] as Id<"questTasks">[], // Will be populated when tasks are created
        requiredItemIds: formData.requiredItemIds.length > 0 ? formData.requiredItemIds : undefined,
        involvedNpcIds: formData.involvedNpcIds.length > 0 ? formData.involvedNpcIds : undefined,
        participantIds: formData.participantIds.length > 0 ? formData.participantIds : undefined,
        interactions: formData.interactions.length > 0 ? formData.interactions : undefined,
        rewards: Object.keys(formData.rewards).length > 0 ? formData.rewards : undefined,
        clerkId: user.id,
      };

      const questId = await createQuest(questData);
      navigate(`/quests/${questId}`);
    } catch (error) {
      console.error("Error creating quest:", error);
      setErrors({ submit: "Failed to create quest. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (returnTo === 'campaign-form') {
      navigate("/campaigns/new");
    } else {
      navigate("/quests");
    }
  };

  if (!user) {
    return <div className="loading">Loading user...</div>;
  }

  return (
    <div className="quest-creation-form">
      <div className="form-header">
        <h1>Create New Quest</h1>
        <button className="cancel-btn" onClick={handleCancel}>
          {returnTo === 'campaign-form' ? "Back to Campaign Form" : "Cancel"}
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
        </div>

        {/* Location */}
        <div className="form-section">
          <h2>Location</h2>
          <div className="form-group">
            <label htmlFor="locationId">Associated Location</label>
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
        </div>

        {/* Participants */}
        <div className="form-section">
          <h2>Participants</h2>
          <div className="form-group">
            <label>Player Characters</label>
            <div className="checkbox-group">
              {characters?.map((character: any) => (
                <label key={character._id} className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={formData.participantIds.includes(character._id)}
                    onChange={() => handleMultiSelectChange("participantIds", character._id)}
                  />
                  <span>{character.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Involved NPCs</label>
            <div className="checkbox-group">
              {npcs?.map((npc: any) => (
                <label key={npc._id} className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={formData.involvedNpcIds.includes(npc._id)}
                    onChange={() => handleMultiSelectChange("involvedNpcIds", npc._id)}
                  />
                  <span>{npc.name}</span>
                </label>
              ))}
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

        {/* Rewards */}
        <div className="form-section">
          <h2>Rewards</h2>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="xpReward">Experience Points</label>
              <input
                type="number"
                id="xpReward"
                name="xpReward"
                value={formData.rewards.xp || ""}
                onChange={(e) => handleRewardChange("xp", Number(e.target.value) || undefined)}
                placeholder="0"
                min="0"
              />
            </div>

            <div className="form-group">
              <label htmlFor="goldReward">Gold</label>
              <input
                type="number"
                id="goldReward"
                name="goldReward"
                value={formData.rewards.gold || ""}
                onChange={(e) => handleRewardChange("gold", Number(e.target.value) || undefined)}
                placeholder="0"
                min="0"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Reward Items</label>
            <div className="checkbox-group">
              {items?.map((item: any) => (
                <label key={item._id} className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={formData.rewards.itemIds?.includes(item._id) || false}
                    onChange={() => {
                      const currentItems = formData.rewards.itemIds || [];
                      const newItems = currentItems.includes(item._id)
                        ? currentItems.filter((id) => id !== item._id)
                        : [...currentItems, item._id];
                      handleRewardChange("itemIds", newItems);
                    }}
                  />
                  <span>{item.name}</span>
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
            {isSubmitting ? "Creating Quest..." : "Create Quest"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default QuestCreationForm; 