import React, { useState } from "react";
import type { Item, ItemType, ItemRarity } from "../types/item";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import "./ItemCreationForm.css";

interface ItemCreationFormProps {
  onSubmitSuccess: (itemId: string) => void;
  onCancel: () => void;
}

const itemTypes: ItemType[] = [
  "Weapon",
  "Armor",
  "Potion",
  "Scroll",
  "Wondrous Item",
  "Ring",
  "Rod",
  "Staff",
  "Wand",
  "Ammunition",
  "Adventuring Gear",
  "Tool",
  "Mount",
  "Vehicle",
  "Treasure",
  "Other",
];

const itemRarities: ItemRarity[] = [
  "Common",
  "Uncommon",
  "Rare",
  "Very Rare",
  "Legendary",
  "Artifact",
  "Unique",
];

const ItemCreationForm: React.FC<ItemCreationFormProps> = ({
  onSubmitSuccess,
  onCancel,
}) => {
  const createItem = useMutation(api.items.createItem);

  const [formData, setFormData] = useState<Partial<Item>>({
    name: "",
    type: itemTypes[0], // Default to the first type
    rarity: itemRarities[0], // Default to the first rarity
    description: "",
    effects: "",
    weight: undefined,
    cost: undefined,
    attunement: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      setFormData({
        ...formData,
        [name]: (e.target as HTMLInputElement).checked,
      });
    } else if (type === "number") {
      setFormData({
        ...formData,
        [name]: value ? parseFloat(value) : undefined,
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Enhanced validation
    const requiredFields = {
      name: "Name",
      type: "Type",
      rarity: "Rarity",
      description: "Description"
    };

    const missingFields = Object.entries(requiredFields)
      .filter(([field]) => !formData[field as keyof typeof formData])
      .map(([_, label]) => label);

    if (missingFields.length > 0) {
      setError(`Please fill in all required fields: ${missingFields.join(", ")}`);
      setLoading(false);
      return;
    }

    try {
      // Ensure all required fields are present and properly typed
      const itemData: Item = {
        name: formData.name!,
        type: formData.type!,
        rarity: formData.rarity!,
        description: formData.description!,
        effects: formData.effects,
        weight: formData.weight,
        cost: formData.cost,
        attunement: formData.attunement
      };

      const newItemId = await createItem(itemData);
      onSubmitSuccess(newItemId);
    } catch (err) {
      console.error("Error creating item:", err);
      setError(err instanceof Error ? err.message : "Failed to create item. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="item-creation-form" onSubmit={handleSubmit}>
      <h2>Create New Item</h2>

      {error && <div className="form-error">{error}</div>}

      <div className="form-group">
        <label htmlFor="name">Item Name:</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name || ""}
          onChange={handleChange}
          required
          aria-describedby="name-tooltip"
        />
        <div id="name-tooltip" className="tooltip">
          Enter the name of the item (e.g., "Sword of Life Stealing").
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="type">Type:</label>
        <select
          id="type"
          name="type"
          value={formData.type || ""}
          onChange={handleChange}
          required
          aria-describedby="type-tooltip"
        >
          {itemTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
        <div id="type-tooltip" className="tooltip">
          Select the category of the item (e.g., Weapon, Armor).
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="rarity">Rarity:</label>
        <select
          id="rarity"
          name="rarity"
          value={formData.rarity || ""}
          onChange={handleChange}
          required
          aria-describedby="rarity-tooltip"
        >
          {itemRarities.map((rarity) => (
            <option key={rarity} value={rarity}>
              {rarity}
            </option>
          ))}
        </select>
        <div id="rarity-tooltip" className="tooltip">
          Choose the rarity level of the item (e.g., Common, Legendary).
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="description">Description:</label>
        <textarea
          id="description"
          name="description"
          value={formData.description || ""}
          onChange={handleChange}
          required
          aria-describedby="description-tooltip"
        ></textarea>
        <div id="description-tooltip" className="tooltip">
          Provide a detailed description of the item and its appearance.
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="effects">Effects/Rules:</label>
        <textarea
          id="effects"
          name="effects"
          value={formData.effects || ""}
          onChange={handleChange}
          aria-describedby="effects-tooltip"
        ></textarea>
        <div id="effects-tooltip" className="tooltip">
          Describe any magical effects, special properties, or rules associated
          with the item.
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="weight">Weight (lbs):</label>
        <input
          type="number"
          id="weight"
          name="weight"
          value={formData.weight || ""}
          onChange={handleChange}
          step="0.1"
          aria-describedby="weight-tooltip"
        />
        <div id="weight-tooltip" className="tooltip">
          Enter the item's weight in pounds.
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="cost">Cost (cp):</label>
        <input
          type="number"
          id="cost"
          name="cost"
          value={formData.cost || ""}
          onChange={handleChange}
          aria-describedby="cost-tooltip"
        />
        <div id="cost-tooltip" className="tooltip">
          Enter the item's cost in copper pieces.
        </div>
      </div>

      <div className="form-group checkbox-group">
        <input
          type="checkbox"
          id="attunement"
          name="attunement"
          checked={formData.attunement || false}
          onChange={handleChange}
          aria-describedby="attunement-tooltip"
        />
        <label htmlFor="attunement">Requires Attunement?</label>
        <div id="attunement-tooltip" className="tooltip">
          Check if the item requires attunement.
         flue from the Item creation form.
        </div>
      </div>

      <div className="form-actions">
        <button type="button" onClick={onCancel} disabled={loading}>
          Cancel
        </button>
        <button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create Item"}
        </button>
      </div>
    </form>
  );
};

export default ItemCreationForm;
