import React, { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

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

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    actionCost: "Action",
    type: "COMMONLY_AVAILABLE_UTILITY",
    requiresConcentration: false,
    sourceBook: "PHB",
    // Optional fields based on type
    className: "",
    usesPer: "Long Rest",
    maxUses: "",
    spellLevel: 0 as 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9,
    castingTime: "",
    range: "",
    components: {
      verbal: false,
      somatic: false,
      material: "",
    },
    duration: "",
    savingThrow: {
      ability: "",
      onSave: "",
    },
  });

  useEffect(() => {
    if (action && action[0]) {
      setFormData(action[0]);
    }
  }, [action]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">{editingActionId ? "Edit Action" : "Create New Action"}</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Action Cost</label>
          <select
            name="actionCost"
            value={formData.actionCost}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="Action">Action</option>
            <option value="Bonus Action">Bonus Action</option>
            <option value="Reaction">Reaction</option>
            <option value="No Action">No Action</option>
            <option value="Special">Special</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Type</label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="COMMONLY_AVAILABLE_UTILITY">Commonly Available Utility</option>
            <option value="CLASS_FEATURE">Class Feature</option>
            <option value="SPELL">Spell</option>
          </select>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            name="requiresConcentration"
            checked={formData.requiresConcentration}
            onChange={handleChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label className="ml-2 block text-sm text-gray-900">Requires Concentration</label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Source Book</label>
          <input
            type="text"
            name="sourceBook"
            value={formData.sourceBook}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        {formData.type === "CLASS_FEATURE" && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700">Class Name</label>
              <input
                type="text"
                name="className"
                value={formData.className}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Uses Per</label>
              <select
                name="usesPer"
                value={formData.usesPer}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="Long Rest">Long Rest</option>
                <option value="Short Rest">Short Rest</option>
                <option value="Day">Day</option>
                <option value="Special">Special</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Max Uses</label>
              <input
                type="text"
                name="maxUses"
                value={formData.maxUses}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </>
        )}

        {formData.type === "SPELL" && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700">Spell Level</label>
              <select
                name="spellLevel"
                value={formData.spellLevel}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((level) => (
                  <option key={level} value={level}>
                    {level === 0 ? "Cantrip" : `Level ${level}`}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Casting Time</label>
              <input
                type="text"
                name="castingTime"
                value={formData.castingTime}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Range</label>
              <input
                type="text"
                name="range"
                value={formData.range}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Duration</label>
              <input
                type="text"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Components</h3>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="components.verbal"
                  checked={formData.components.verbal}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">Verbal</label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="components.somatic"
                  checked={formData.components.somatic}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">Somatic</label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Material Components</label>
                <input
                  type="text"
                  name="components.material"
                  value={formData.components.material}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
          </>
        )}

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {editingActionId ? "Save Changes" : "Create Action"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ActionCreationForm; 