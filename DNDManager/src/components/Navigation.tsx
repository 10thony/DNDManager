import React from "react";
import { Link, useLocation } from "react-router-dom";
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
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
