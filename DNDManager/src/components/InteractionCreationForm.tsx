import React, { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { useUser } from "@clerk/clerk-react";
import "./InteractionCreationForm.css";

interface InteractionCreationFormProps {
  onSubmitSuccess: () => void;
  onCancel: () => void;
  editingInteractionId?: Id<"interactions"> | null;
}

const InteractionCreationForm: React.FC<InteractionCreationFormProps> = ({
  onSubmitSuccess,
  onCancel,
  editingInteractionId,
}) => {
  const { user } = useUser();
  const createInteraction = useMutation(api.interactions.createInteraction);
  const updateInteraction = useMutation(api.interactions.updateInteraction);
  const interaction = useQuery(
    api.interactions.getInteractionById,
    editingInteractionId ? { id: editingInteractionId } : "skip"
  );
  const quests = useQuery(api.quests.getAllQuests);
  const questTasks = useQuery(api.questTasks.getAllQuestTasks);
  const playerCharacters = useQuery(api.characters.getAllCharacters);
  const npcs = useQuery(api.npcs.getAllNpcs);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    questId: "",
    questTaskId: "",
    playerCharacterIds: [] as Id<"playerCharacters">[],
    npcIds: [] as Id<"npcs">[],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (interaction) {
      setFormData({
        name: interaction.name,
        description: interaction.description || "",
        questId: interaction.questId || "",
        questTaskId: interaction.questTaskId || "",
        playerCharacterIds: interaction.playerCharacterIds || [],
        npcIds: interaction.npcIds || [],
      });
    }
  }, [interaction]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
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
      const interactionData = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        creatorId: user.id,
        questId: formData.questId ? (formData.questId as Id<"quests">) : undefined,
        questTaskId: formData.questTaskId ? (formData.questTaskId as Id<"questTasks">) : undefined,
        playerCharacterIds: formData.playerCharacterIds.length > 0 ? formData.playerCharacterIds : undefined,
        npcIds: formData.npcIds.length > 0 ? formData.npcIds : undefined,
      };

      if (editingInteractionId) {
        await updateInteraction({
          id: editingInteractionId,
          ...interactionData,
        });
      } else {
        await createInteraction(interactionData);
      }

      onSubmitSuccess();
    } catch (error) {
      console.error("Error saving interaction:", error);
      setErrors({ general: "Failed to save interaction. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleCharacterToggle = (characterId: Id<"playerCharacters">) => {
    const newCharacterIds = formData.playerCharacterIds.includes(characterId)
      ? formData.playerCharacterIds.filter(id => id !== characterId)
      : [...formData.playerCharacterIds, characterId];
    handleInputChange("playerCharacterIds", newCharacterIds);
  };

  const handleNpcToggle = (npcId: Id<"npcs">) => {
    const newNpcIds = formData.npcIds.includes(npcId)
      ? formData.npcIds.filter(id => id !== npcId)
      : [...formData.npcIds, npcId];
    handleInputChange("npcIds", newNpcIds);
  };

  const filteredQuestTasks = questTasks?.filter(task => 
    !formData.questId || task.questId === formData.questId
  ) || [];

  return (
    <div className="interaction-form">
      <div className="form-header">
        <h2 className="form-section-title">
          {editingInteractionId ? "Edit Interaction" : "Create New Interaction"}
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
              <label className="form-label" htmlFor="name">
                Interaction Name *
              </label>
              <input
                type="text"
                id="name"
                className="form-input"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Enter interaction name"
              />
              {errors.name && <div className="form-error">{errors.name}</div>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-col full-width">
              <label className="form-label" htmlFor="description">
                Description
              </label>
              <textarea
                id="description"
                className="form-textarea"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Describe the interaction..."
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3 className="form-section-title">Quest Association</h3>
          
          <div className="form-row">
            <div className="form-col">
              <label className="form-label" htmlFor="questId">
                Associated Quest
              </label>
              <select
                id="questId"
                className="form-select"
                value={formData.questId}
                onChange={(e) => handleInputChange("questId", e.target.value)}
              >
                <option value="">Select a quest (optional)</option>
                {quests?.map((quest) => (
                  <option key={quest._id} value={quest._id}>
                    {quest.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-col">
              <label className="form-label" htmlFor="questTaskId">
                Associated Quest Task
              </label>
              <select
                id="questTaskId"
                className="form-select"
                value={formData.questTaskId}
                onChange={(e) => handleInputChange("questTaskId", e.target.value)}
                disabled={!formData.questId}
              >
                <option value="">Select a task (optional)</option>
                {filteredQuestTasks.map((task) => (
                  <option key={task._id} value={task._id}>
                    {task.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3 className="form-section-title">Participants</h3>
          
          <div className="form-row">
            <div className="form-col">
              <label className="form-label">Player Characters</label>
              <div className="participants-grid">
                {playerCharacters?.map((character: any) => (
                  <label key={character._id} className="checkbox-label">
                    <input
                      type="checkbox"
                      className="checkbox-input"
                      checked={formData.playerCharacterIds.includes(character._id)}
                      onChange={() => handleCharacterToggle(character._id)}
                    />
                    <span className="checkbox-text">{character.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="form-col">
              <label className="form-label">NPCs</label>
              <div className="participants-grid">
                {npcs?.map((npc) => (
                  <label key={npc._id} className="checkbox-label">
                    <input
                      type="checkbox"
                      className="checkbox-input"
                      checked={formData.npcIds.includes(npc._id)}
                      onChange={() => handleNpcToggle(npc._id)}
                    />
                    <span className="checkbox-text">{npc.name}</span>
                  </label>
                ))}
              </div>
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
              ? editingInteractionId
                ? "Updating..."
                : "Creating..."
              : editingInteractionId
              ? "Update Interaction"
              : "Create Interaction"
            }
          </button>
        </div>
      </form>
    </div>
  );
};

export default InteractionCreationForm; 