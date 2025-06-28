import React, { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import ItemCard from "./ItemCard";
import ItemCreationForm from "./ItemCreationForm";
import BulkItemGenerator from "./BulkItemGenerator";
import "./ItemList.css";

const ItemList: React.FC = () => {
  const [isCreating, setIsCreating] = useState(false);
  const items = useQuery(api.items.getItems);

  const handleCancel = () => {
    setIsCreating(false);
  };

  const handleSubmitSuccess = (itemId: string) => {
    setIsCreating(false);
  };

  const handleGenerationComplete = () => {
    // The items will automatically refresh due to Convex's reactive queries
  };

  if (isCreating) {
    return (
      <div className="item-list">
        <div className="item-list-header">
          <button
            onClick={handleCancel}
            className="back-button"
          >
            ← Back to Items
          </button>
        </div>
        <ItemCreationForm 
          onSubmitSuccess={handleSubmitSuccess}
          onCancel={handleCancel}
        />
      </div>
    );
  }

  if (!items) {
    return <div className="loading">Loading items...</div>;
  }

  return (
    <div className="item-list">
      <div className="item-list-header">
        <h2>Items</h2>
        <button
          className="create-button"
          onClick={() => setIsCreating(true)}
        >
          Create New Item
        </button>
      </div>
      
      {items.length === 0 && (
        <BulkItemGenerator onGenerationComplete={handleGenerationComplete} />
      )}
      
      <div className="item-grid">
        {items.map((item) => (
          <ItemCard key={item._id} item={item} />
        ))}
      </div>
    </div>
  );
};

export default ItemList; 