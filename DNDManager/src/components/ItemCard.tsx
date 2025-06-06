import React from "react";
import type { Item } from "../types/item";
import "./ItemCard.css"; // Basic styling
import { Link } from "react-router-dom"; // For linking to details

interface ItemCardProps {
  item: Item;
  onClick?: (item: Item) => void;
}

const ItemCard: React.FC<ItemCardProps> = ({ item, onClick }) => {
  const handleClick = () => {
    if (onClick) {
      onClick(item);
    }
  };

  return (
    <Link to={`/items/${item._id}`} className="item-card-link">
      <div className="item-card" onClick={handleClick}>
        <div className="item-card-header">
          <h3 className="item-card-name">{item.name}</h3>
          <span className={`item-card-rarity rarity-${item.rarity.toLowerCase().replace(/\s+/g, "-")}`}>
            {item.rarity}
          </span>
        </div>
        <div className="item-card-body">
          <p className="item-card-type">{item.type}</p>
          {/* Optionally add a brief description snippet */}
        </div>
      </div>
    </Link>
  );
};

export default ItemCard;
