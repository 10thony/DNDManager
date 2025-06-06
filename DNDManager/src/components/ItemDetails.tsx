import React from "react";
import type { Item } from "../types/item";
import "./ItemDetails.css"; // Basic styling

interface ItemDetailsProps {
  item: Item;
  onEdit?: (item: Item) => void; // Optional edit callback
  onDelete?: (itemId: string) => void; // Optional delete callback
}

const ItemDetails: React.FC<ItemDetailsProps> = ({
  item,
  onEdit,
  onDelete,
}) => {
  const handleDelete = () => {
    if (onDelete && item._id) {
      if (window.confirm(`Are you sure you want to delete "${item.name}"?`)) {
        onDelete(item._id);
      }
    }
  };

  return (
    <div className="item-details">
      <h2 className="item-details-name">{item.name}</h2>
      <p className="item-details-meta">
        <span className="item-details-type">{item.type}</span> -{" "}
        <span className={`item-details-rarity rarity-${item.rarity.toLowerCase().replace(/\s+/g, "-")}`}>
          {item.rarity}
        </span>
        {item.attunement && (
          <span className="item-details-attunement">(Requires Attunement)</span>
        )}
      </p>

      {item.weight !== undefined && (
        <p className="item-details-attribute">
          <strong>Weight:</strong> {item.weight} lbs
        </p>
      )}
      {item.cost !== undefined && (
        <p className="item-details-attribute">
          <strong>Cost:</strong> {item.cost} cp
        </p>
      )}

      <div className="item-details-section">
        <h3>Description</h3>
        <p className="item-details-description">{item.description}</p>
      </div>

      {item.effects && (
        <div className="item-details-section">
          <h3>Effects</h3>
          <p className="item-details-effects">{item.effects}</p>
        </div>
      )}

      {/* Add other relevant fields here */}

      {(onEdit || onDelete) && (
        <div className="item-details-actions">
          {onEdit && (
            <button className="edit-button" onClick={() => onEdit(item)}>
              Edit
            </button>
          )}
          {onDelete && (
            <button className="delete-button" onClick={handleDelete}>
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ItemDetails;
