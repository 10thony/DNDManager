import React from "react";
import { Link, useLocation } from "react-router-dom";
import { SignOutButton } from "@clerk/clerk-react";
import "./Navigation.css";

const Navigation: React.FC = () => {
  const location = useLocation();

  return (
    <nav className="navigation">
      <div className="nav-container">
        <Link to="/characters" className="nav-brand">
          D&D Character Manager
        </Link>
        <div className="nav-links">
          <Link
            to="/characters"
            className={`nav-link ${
              location.pathname === "/characters" ? "active" : ""
            }`}
          >
            Characters
          </Link>
          <Link
            to="/create-character"
            className={`nav-link ${
              location.pathname === "/create-character" ? "active" : ""
            }`}
          >
            Create Character
          </Link>
          <Link
            to="/newItem"
            className={`nav-link ${
              location.pathname === "/newItem" ? "active" : ""
            }`}
          >
            Create Item
          </Link>
          <Link
            to="/items"
            className={`nav-link ${
              location.pathname === "/items" ? "active" : ""
            }`}
          >
            Items
          </Link>
          <Link
            to="/locations"
            className={`nav-link ${
              location.pathname === "/locations" ? "active" : ""
            }`}
          >
            Locations
          </Link>
          <Link
            to="/maps"
            className={`nav-link ${
              location.pathname.startsWith("/maps") ? "active" : ""
            }`}
          >
            Maps
          </Link>
          <SignOutButton>
            <button className="nav-link sign-out">Sign Out</button>
          </SignOutButton>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
