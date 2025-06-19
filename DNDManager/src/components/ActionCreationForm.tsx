import React, { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import "./ActionCreationForm.css";

interface ActionCreationFormProps {
  onSubmitSuccess: () => void;
  onCancel: () => void;
  editingActionId?: Id<"actions"> | null;
}

const ActionCreationForm: React.FC<ActionCreationFormProps> = ({
  onSubmitSuccess,
  onCancel,
  editingActionId,
}) => {
  const createAction = useMutation(api.actions.createAction);
  const updateAction = useMutation(api.actions.updateAction);
  const action = useQuery(api.actions.getActionsByIds, {
    ids: editingActionId ? [editingActionId] : [],
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    actionCost: "Action" as "Action" | "Bonus Action" | "Reaction" | "No Action" | "Special",
    type: "COMMONLY_AVAILABLE_UTILITY" as "MELEE_ATTACK" | "RANGED_ATTACK" | "SPELL" | "COMMONLY_AVAILABLE_UTILITY" | "CLASS_FEATURE" | "BONUS_ACTION" | "REACTION" | "OTHER",
    requiresConcentration: false,
    sourceBook: "PHB",
    // Optional fields based on type
    className: "",
    usesPer: "Long Rest" as "Short Rest" | "Long Rest" | "Day" | "Special" | undefined,
    maxUses: "",
    spellLevel: 0 as 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | undefined,
    castingTime: "",
    range: "",
    components: {
      verbal: false,
      somatic: false,
      material: "" as string | undefined,
    } as {
      verbal: boolean;
      somatic: boolean;
      material?: string;
    },
    duration: "",
    savingThrow: {
      ability: "",
      onSave: "",
    },
  });

  useEffect(() => {
    if (action && action[0]) {
      const actionData = action[0];
      setFormData({
        name: actionData.name,
        description: actionData.description,
        actionCost: actionData.actionCost,
        type: actionData.type,
        requiresConcentration: actionData.requiresConcentration,
        sourceBook: actionData.sourceBook,
        className: actionData.className || "",
        usesPer: actionData.usesPer,
        maxUses: actionData.maxUses?.toString() || "",
        spellLevel: actionData.spellLevel,
        castingTime: actionData.castingTime || "",
        range: actionData.range || "",
        components: actionData.components || {
          verbal: false,
          somatic: false,
          material: "",
        },
        duration: actionData.duration || "",
        savingThrow: actionData.savingThrow || {
          ability: "",
          onSave: "",
        },
      });
    }
  }, [action]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (editingActionId) {
        await updateAction({
          id: editingActionId,
          ...formData,
        });
      } else {
        await createAction(formData);
      }
      onSubmitSuccess();
    } catch (error) {
      console.error("Error saving action:", error);
      setError(error instanceof Error ? error.message : "Failed to save action");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleComponentChange = (component: string, value: boolean | string) => {
    setFormData(prev => ({
      ...prev,
      components: {
        ...prev.components,
        [component]: value,
      },
    }));
  };

  return (
    <div className="action-form">
      <div className="form-header">
        <button type="button" onClick={onCancel} className="back-button">
          ← Back to Actions List
        </button>
        <h2 className="form-section-title">
          {editingActionId ? "Edit Action" : "Create New Action"}
        </h2>
      </div>

      {error && <div className="form-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        {/* Basic Information Section */}
        <div className="form-section">
          <div className="form-section-title">Basic Information</div>
          <div className="form-row">
            <div className="form-col">
              <label htmlFor="name" className="form-label">Action Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                className="form-input"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-col">
              <label htmlFor="actionCost" className="form-label">Action Cost *</label>
              <select
                id="actionCost"
                name="actionCost"
                className="form-select"
                value={formData.actionCost}
                onChange={handleChange}
                required
              >
                <option value="Action">Action</option>
                <option value="Bonus Action">Bonus Action</option>
                <option value="Reaction">Reaction</option>
                <option value="No Action">No Action</option>
                <option value="Special">Special</option>
              </select>
            </div>
            <div className="form-col">
              <label htmlFor="type" className="form-label">Type *</label>
              <select
                id="type"
                name="type"
                className="form-select"
                value={formData.type}
                onChange={handleChange}
                required
              >
                <option value="COMMONLY_AVAILABLE_UTILITY">Commonly Available Utility</option>
                <option value="CLASS_FEATURE">Class Feature</option>
                <option value="SPELL">Spell</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-col">
              <label htmlFor="sourceBook" className="form-label">Source Book *</label>
              <input
                type="text"
                id="sourceBook"
                name="sourceBook"
                className="form-input"
                value={formData.sourceBook}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-col">
              <div className="checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="requiresConcentration"
                    checked={formData.requiresConcentration}
                    onChange={handleChange}
                    className="checkbox-input"
                  />
                  <span className="checkbox-text">Requires Concentration</span>
                </label>
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-col full-width">
              <label htmlFor="description" className="form-label">Description *</label>
              <textarea
                id="description"
                name="description"
                className="form-textarea"
                value={formData.description}
                onChange={handleChange}
                required
                rows={4}
                placeholder="Enter a detailed description of the action..."
              />
            </div>
          </div>
        </div>

        {/* Class Feature Section */}
        {formData.type === "CLASS_FEATURE" && (
          <div className="form-section">
            <div className="form-section-title">Class Feature Details</div>
            <div className="form-row">
              <div className="form-col">
                <label htmlFor="className" className="form-label">Class Name *</label>
                <input
                  type="text"
                  id="className"
                  name="className"
                  className="form-input"
                  value={formData.className}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-col">
                <label htmlFor="usesPer" className="form-label">Uses Per</label>
                <select
                  id="usesPer"
                  name="usesPer"
                  className="form-select"
                  value={formData.usesPer}
                  onChange={handleChange}
                >
                  <option value="Long Rest">Long Rest</option>
                  <option value="Short Rest">Short Rest</option>
                  <option value="Day">Day</option>
                  <option value="Special">Special</option>
                </select>
              </div>
              <div className="form-col">
                <label htmlFor="maxUses" className="form-label">Max Uses</label>
                <input
                  type="text"
                  id="maxUses"
                  name="maxUses"
                  className="form-input"
                  value={formData.maxUses}
                  onChange={handleChange}
                  placeholder="e.g., 3, 1/rest, etc."
                />
              </div>
            </div>
          </div>
        )}

        {/* Spell Section */}
        {formData.type === "SPELL" && (
          <div className="form-section">
            <div className="form-section-title">Spell Details</div>
            <div className="form-row">
              <div className="form-col">
                <label htmlFor="spellLevel" className="form-label">Spell Level *</label>
                <select
                  id="spellLevel"
                  name="spellLevel"
                  className="form-select"
                  value={formData.spellLevel}
                  onChange={handleChange}
                  required
                >
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((level) => (
                    <option key={level} value={level}>
                      {level === 0 ? "Cantrip" : `Level ${level}`}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-col">
                <label htmlFor="castingTime" className="form-label">Casting Time *</label>
                <input
                  type="text"
                  id="castingTime"
                  name="castingTime"
                  className="form-input"
                  value={formData.castingTime}
                  onChange={handleChange}
                  required
                  placeholder="e.g., 1 action, 1 minute"
                />
              </div>
              <div className="form-col">
                <label htmlFor="range" className="form-label">Range *</label>
                <input
                  type="text"
                  id="range"
                  name="range"
                  className="form-input"
                  value={formData.range}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Self, 60 feet, Touch"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-col">
                <label htmlFor="duration" className="form-label">Duration *</label>
                <input
                  type="text"
                  id="duration"
                  name="duration"
                  className="form-input"
                  value={formData.duration}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Instantaneous, 1 hour, Concentration"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-col full-width">
                <label className="form-label">Components</label>
                <div className="components-grid">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.components.verbal}
                      onChange={(e) => handleComponentChange("verbal", e.target.checked)}
                      className="checkbox-input"
                    />
                    <span className="checkbox-text">Verbal (V)</span>
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.components.somatic}
                      onChange={(e) => handleComponentChange("somatic", e.target.checked)}
                      className="checkbox-input"
                    />
                    <span className="checkbox-text">Somatic (S)</span>
                  </label>
                  <div className="material-component">
                    <label htmlFor="material" className="form-label">Material Components</label>
                    <input
                      type="text"
                      id="material"
                      className="form-input"
                      value={formData.components.material}
                      onChange={(e) => handleComponentChange("material", e.target.value)}
                      placeholder="e.g., A piece of iron, 50gp worth of diamond dust"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={isLoading}>
            {isLoading ? "Saving..." : (editingActionId ? "Save Changes" : "Create Action")}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ActionCreationForm; 