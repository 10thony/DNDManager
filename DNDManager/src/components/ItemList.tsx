import React from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import ItemCard from "./ItemCard";
import "./ItemList.css";

const ItemList: React.FC = () => {
  const items = useQuery(api.items.getItems);

  if (!items) {
    return <div className="loading">Loading items...</div>;
  }

  return (
    <div className="item-list">
      <h2>Items</h2>
      <div className="item-grid">
        {items.map((item) => (
          <ItemCard key={item._id} item={item} />
        ))}
      </div>
    </div>
  );
};

export default ItemList; 