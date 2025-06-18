import React from "react";
import { Link, useLocation } from "react-router-dom";
import { SignOutButton } from "@clerk/clerk-react";
import "./Navigation.css";

interface NavigationProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

const Navigation: React.FC<NavigationProps> = ({ isCollapsed, setIsCollapsed }) => {
  const location = useLocation();

  const toggleNavigation = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <>
      <button 
        className="nav-toggle"
        onClick={toggleNavigation}
        aria-label={isCollapsed ? "Expand navigation" : "Collapse navigation"}
      >
        {isCollapsed ? "☰" : "✕"}
      </button>
      <nav className={`navigation ${isCollapsed ? "collapsed" : ""}`}>
        <div className="nav-container">
          <span className="nav-brand" />
          <div className="nav-links">
            <Link
              to="/characters"
              className={`nav-link ${
                location.pathname === "/characters" ? "active" : ""
              }`}
              title="Characters"
            >
              {isCollapsed ? "👥" : "Characters"}
            </Link>
            <Link
              to="/create-character"
              className={`nav-link ${
                location.pathname === "/create-character" ? "active" : ""
              }`}
              title="Create Character"
            >
              {isCollapsed ? "➕" : "Create Character"}
            </Link>
            <Link
              to="/newItem"
              className={`nav-link ${
                location.pathname === "/newItem" ? "active" : ""
              }`}
              title="Create Item"
            >
              {isCollapsed ? "🔧" : "Create Item"}
            </Link>
            <Link
              to="/items"
              className={`nav-link ${
                location.pathname === "/items" ? "active" : ""
              }`}
              title="Items"
            >
              {isCollapsed ? "📦" : "Items"}
            </Link>
            <Link
              to="/actions"
              className={`nav-link ${
                location.pathname.startsWith("/actions") ? "active" : ""
              }`}
              title="Actions"
            >
              {isCollapsed ? "⚔️" : "Actions"}
            </Link>
            <Link
              to="/locations"
              className={`nav-link ${
                location.pathname === "/locations" ? "active" : ""
              }`}
              title="Locations"
            >
              {isCollapsed ? "🗺️" : "Locations"}
            </Link>
            <Link
              to="/maps"
              className={`nav-link ${
                location.pathname.startsWith("/maps") ? "active" : ""
              }`}
              title="Maps"
            >
              {isCollapsed ? "🗺️" : "Maps"}
            </Link>
            <SignOutButton>
              <button className="nav-link sign-out" title="Sign Out">
                {isCollapsed ? "🚪" : "Sign Out"}
              </button>
            </SignOutButton>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navigation;
