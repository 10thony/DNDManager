import React, { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { useUser } from "@clerk/clerk-react";
import "./MonsterCreationForm.css";

interface MonsterFormProps {
  onSubmitSuccess: () => void;
  onCancel: () => void;
  editingMonsterId?: Id<"monsters"> | null;
}

const MonsterForm: React.FC<MonsterFormProps> = ({
  onSubmitSuccess,
  onCancel,
  editingMonsterId,
}) => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get('returnTo');

  const [formData, setFormData] = useState({
    campaignId: undefined as Id<"campaigns"> | undefined,
    name: "",
    source: "",
    page: "",
    size: "Medium" as "Tiny" | "Small" | "Medium" | "Large" | "Huge" | "Gargantuan",
    type: "",
    tags: [] as string[],
    alignment: "",
    armorClass: 10,
    armorType: "",
    hitPoints: 10,
    hitDice: { count: 1, die: "d8" as "d4" | "d6" | "d8" | "d10" | "d12" },
    proficiencyBonus: 2,
    speed: { walk: "30 ft.", swim: "", fly: "", burrow: "", climb: "" } as {
      walk?: string;
      swim?: string;
      fly?: string;
      burrow?: string;
      climb?: string;
    },
    abilityScores: {
      strength: 10,
      dexterity: 10,
      constitution: 10,
      intelligence: 10,
      wisdom: 10,
      charisma: 10,
    },
    savingThrows: [] as string[],
    skills: [] as string[],
    damageVulnerabilities: [] as string[],
    damageResistances: [] as string[],
    damageImmunities: [] as string[],
    conditionImmunities: [] as string[],
    senses: {
      darkvision: "",
      blindsight: "",
      tremorsense: "",
      truesight: "",
      passivePerception: 10,
    } as {
      darkvision?: string;
      blindsight?: string;
      tremorsense?: string;
      truesight?: string;
      passivePerception: number;
    },
    languages: "",
    challengeRating: "1/4",
    experiencePoints: 50,
    traits: [] as Array<{ name: string; description: string }>,
    actions: [] as Array<{ name: string; description: string }>,
    reactions: [] as Array<{ name: string; description: string }>,
    legendaryActions: [] as Array<{ name: string; description: string }>,
    lairActions: [] as Array<{ name: string; description: string }>,
    regionalEffects: [] as Array<{ name: string; description: string }>,
    environment: [] as string[],
    clerkId: user?.id,
  });

  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const campaigns = useQuery(api.campaigns.getAllCampaigns, { clerkId: user?.id });
  const createMonster = useMutation(api.monsters.createMonster);
  const updateMonster = useMutation(api.monsters.updateMonster);
  const editingMonster = useQuery(
    api.monsters.getMonsterById,
    editingMonsterId ? { id: editingMonsterId } : "skip"
  );

  useEffect(() => {
    if (editingMonster && editingMonsterId) {
      setFormData({
        campaignId: editingMonster.campaignId || undefined,
        name: editingMonster.name,
        source: editingMonster.source || "",
        page: editingMonster.page || "",
        size: editingMonster.size,
        type: editingMonster.type,
        tags: editingMonster.tags || [],
        alignment: editingMonster.alignment,
        armorClass: editingMonster.armorClass,
        armorType: editingMonster.armorType || "",
        hitPoints: editingMonster.hitPoints,
        hitDice: editingMonster.hitDice,
        proficiencyBonus: editingMonster.proficiencyBonus,
        speed: editingMonster.speed || { walk: "30 ft.", swim: "", fly: "", burrow: "", climb: "" },
        abilityScores: editingMonster.abilityScores,
        savingThrows: editingMonster.savingThrows || [],
        skills: editingMonster.skills || [],
        damageVulnerabilities: editingMonster.damageVulnerabilities || [],
        damageResistances: editingMonster.damageResistances || [],
        damageImmunities: editingMonster.damageImmunities || [],
        conditionImmunities: editingMonster.conditionImmunities || [],
        senses: editingMonster.senses || { darkvision: "", blindsight: "", tremorsense: "", truesight: "", passivePerception: 10 },
        languages: editingMonster.languages || "",
        challengeRating: editingMonster.challengeRating,
        experiencePoints: editingMonster.experiencePoints || 0,
        traits: editingMonster.traits || [],
        actions: editingMonster.actions || [],
        reactions: editingMonster.reactions || [],
        legendaryActions: editingMonster.legendaryActions || [],
        lairActions: editingMonster.lairActions || [],
        regionalEffects: editingMonster.regionalEffects || [],
        environment: editingMonster.environment || [],
        clerkId: user?.id,
      });
    }
  }, [editingMonster, editingMonsterId]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNestedChange = (parentField: string, childField: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parentField]: { ...(prev[parentField as keyof typeof prev] as Record<string, any>), [childField]: value }
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: string[] = [];

    if (!formData.name.trim()) newErrors.push("Name is required");
    if (!formData.type.trim()) newErrors.push("Type is required");
    if (!formData.alignment.trim()) newErrors.push("Alignment is required");
    if (formData.armorClass < 0) newErrors.push("Armor Class must be positive");
    if (formData.hitPoints <= 0) newErrors.push("Hit Points must be positive");
    if (formData.hitDice.count <= 0) newErrors.push("Hit Dice count must be positive");
    if (formData.proficiencyBonus < 0) newErrors.push("Proficiency Bonus must be non-negative");
    if (formData.senses.passivePerception < 0) newErrors.push("Passive Perception must be non-negative");

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      if (editingMonsterId) {
        await updateMonster({
          id: editingMonsterId,
          ...formData,
        });
      } else {
        await createMonster({
          ...formData,
          clerkId: user!.id,
        });
      }
      onSubmitSuccess();
    } catch (error) {
      console.error("Error saving monster:", error);
      setErrors(["Failed to save monster. Please try again."]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (returnTo === 'campaign-form') {
      navigate("/campaigns/new");
    } else {
      onCancel();
    }
  };

  if (!campaigns) {
    return (
      <div className="monster-form">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading campaigns...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="monster-form">
      <div className="form-header">
        <h2>{editingMonsterId ? "Edit Monster" : "Create New Monster"}</h2>
        <button className="back-button" onClick={handleCancel}>
          {returnTo === 'campaign-form' ? "← Back to Campaign Form" : "← Back to Monsters"}
        </button>
      </div>

      {errors.length > 0 && (
        <div className="form-error">
          {errors.map((error, index) => (
            <div key={index}>{error}</div>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Basic Information */}
        <div className="form-section">
          <h3 className="form-section-title">Basic Information</h3>
          <div className="form-row">
            <div className="form-col">
              <label className="form-label">Name *</label>
              <input
                type="text"
                className="form-input"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Monster name"
              />
            </div>
            <div className="form-col">
              <label className="form-label">Campaign</label>
              <select
                className="form-select"
                value={formData.campaignId}
                onChange={(e) => handleInputChange("campaignId", e.target.value)}
              >
                <option value="">Select a campaign</option>
                {campaigns.map((campaign) => (
                  <option key={campaign._id} value={campaign._id}>
                    {campaign.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-col">
              <label className="form-label">Type *</label>
              <input
                type="text"
                className="form-input"
                value={formData.type}
                onChange={(e) => handleInputChange("type", e.target.value)}
                placeholder="e.g., Dragon, Undead, Beast"
              />
            </div>
            <div className="form-col">
              <label className="form-label">Size</label>
              <select
                className="form-select"
                value={formData.size}
                onChange={(e) => handleInputChange("size", e.target.value)}
              >
                <option value="Tiny">Tiny</option>
                <option value="Small">Small</option>
                <option value="Medium">Medium</option>
                <option value="Large">Large</option>
                <option value="Huge">Huge</option>
                <option value="Gargantuan">Gargantuan</option>
              </select>
            </div>
            <div className="form-col">
              <label className="form-label">Alignment *</label>
              <input
                type="text"
                className="form-input"
                value={formData.alignment}
                onChange={(e) => handleInputChange("alignment", e.target.value)}
                placeholder="e.g., Lawful Good, Chaotic Evil"
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-col">
              <label className="form-label">Source Book</label>
              <input
                type="text"
                className="form-input"
                value={formData.source}
                onChange={(e) => handleInputChange("source", e.target.value)}
                placeholder="e.g., Monster Manual"
              />
            </div>
            <div className="form-col">
              <label className="form-label">Page</label>
              <input
                type="text"
                className="form-input"
                value={formData.page}
                onChange={(e) => handleInputChange("page", e.target.value)}
                placeholder="e.g., 42"
              />
            </div>
            <div className="form-col">
              <label className="form-label">Challenge Rating</label>
              <input
                type="text"
                className="form-input"
                value={formData.challengeRating}
                onChange={(e) => handleInputChange("challengeRating", e.target.value)}
                placeholder="e.g., 1/4, 1, 5"
              />
            </div>
          </div>
        </div>

        {/* Combat Stats */}
        <div className="form-section">
          <h3 className="form-section-title">Combat Statistics</h3>
          <div className="form-row">
            <div className="form-col">
              <label className="form-label">Armor Class *</label>
              <input
                type="number"
                className="form-input"
                value={formData.armorClass}
                onChange={(e) => handleInputChange("armorClass", parseInt(e.target.value) || 0)}
                min="0"
              />
            </div>
            <div className="form-col">
              <label className="form-label">Armor Type</label>
              <input
                type="text"
                className="form-input"
                value={formData.armorType}
                onChange={(e) => handleInputChange("armorType", e.target.value)}
                placeholder="e.g., Natural Armor"
              />
            </div>
            <div className="form-col">
              <label className="form-label">Hit Points *</label>
              <input
                type="number"
                className="form-input"
                value={formData.hitPoints}
                onChange={(e) => handleInputChange("hitPoints", parseInt(e.target.value) || 0)}
                min="1"
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-col">
              <label className="form-label">Hit Dice Count</label>
              <input
                type="number"
                className="form-input"
                value={formData.hitDice.count}
                onChange={(e) => handleNestedChange("hitDice", "count", parseInt(e.target.value) || 0)}
                min="1"
              />
            </div>
            <div className="form-col">
              <label className="form-label">Hit Dice Type</label>
              <select
                className="form-select"
                value={formData.hitDice.die}
                onChange={(e) => handleNestedChange("hitDice", "die", e.target.value)}
              >
                <option value="d4">d4</option>
                <option value="d6">d6</option>
                <option value="d8">d8</option>
                <option value="d10">d10</option>
                <option value="d12">d12</option>
              </select>
            </div>
            <div className="form-col">
              <label className="form-label">Proficiency Bonus</label>
              <input
                type="number"
                className="form-input"
                value={formData.proficiencyBonus}
                onChange={(e) => handleInputChange("proficiencyBonus", parseInt(e.target.value) || 0)}
                min="0"
              />
            </div>
          </div>
        </div>

        {/* Ability Scores */}
        <div className="form-section">
          <h3 className="form-section-title">Ability Scores</h3>
          <div className="form-row">
            {Object.entries(formData.abilityScores).map(([ability, score]) => (
              <div key={ability} className="form-col">
                <label className="form-label">{ability.charAt(0).toUpperCase() + ability.slice(1)}</label>
                <input
                  type="number"
                  className="form-input"
                  value={score}
                  onChange={(e) => handleNestedChange("abilityScores", ability, parseInt(e.target.value) || 0)}
                  min="1"
                  max="30"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Speed */}
        <div className="form-section">
          <h3 className="form-section-title">Speed</h3>
          <div className="form-row">
            {Object.entries(formData.speed).map(([movementType, speed]) => (
              <div key={movementType} className="form-col">
                <label className="form-label">{movementType.charAt(0).toUpperCase() + movementType.slice(1)}</label>
                <input
                  type="text"
                  className="form-input"
                  value={speed}
                  onChange={(e) => handleNestedChange("speed", movementType, e.target.value)}
                  placeholder="e.g., 30 ft."
                />
              </div>
            ))}
          </div>
        </div>

        {/* Senses */}
        <div className="form-section">
          <h3 className="form-section-title">Senses</h3>
          <div className="form-row">
            <div className="form-col">
              <label className="form-label">Darkvision</label>
              <input
                type="text"
                className="form-input"
                value={formData.senses.darkvision}
                onChange={(e) => handleNestedChange("senses", "darkvision", e.target.value)}
                placeholder="e.g., 60 ft."
              />
            </div>
            <div className="form-col">
              <label className="form-label">Blindsight</label>
              <input
                type="text"
                className="form-input"
                value={formData.senses.blindsight}
                onChange={(e) => handleNestedChange("senses", "blindsight", e.target.value)}
                placeholder="e.g., 30 ft."
              />
            </div>
            <div className="form-col">
              <label className="form-label">Tremorsense</label>
              <input
                type="text"
                className="form-input"
                value={formData.senses.tremorsense}
                onChange={(e) => handleNestedChange("senses", "tremorsense", e.target.value)}
                placeholder="e.g., 60 ft."
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-col">
              <label className="form-label">Truesight</label>
              <input
                type="text"
                className="form-input"
                value={formData.senses.truesight}
                onChange={(e) => handleNestedChange("senses", "truesight", e.target.value)}
                placeholder="e.g., 120 ft."
              />
            </div>
            <div className="form-col">
              <label className="form-label">Passive Perception</label>
              <input
                type="number"
                className="form-input"
                value={formData.senses.passivePerception}
                onChange={(e) => handleNestedChange("senses", "passivePerception", parseInt(e.target.value) || 0)}
                min="0"
              />
            </div>
            <div className="form-col">
              <label className="form-label">Languages</label>
              <input
                type="text"
                className="form-input"
                value={formData.languages}
                onChange={(e) => handleInputChange("languages", e.target.value)}
                placeholder="e.g., Common, Draconic"
              />
            </div>
          </div>
        </div>

        {/* Experience Points */}
        <div className="form-section">
          <h3 className="form-section-title">Experience</h3>
          <div className="form-row">
            <div className="form-col">
              <label className="form-label">Experience Points</label>
              <input
                type="number"
                className="form-input"
                value={formData.experiencePoints}
                onChange={(e) => handleInputChange("experiencePoints", parseInt(e.target.value) || 0)}
                min="0"
              />
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : editingMonsterId ? "Update Monster" : "Create Monster"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MonsterForm; 