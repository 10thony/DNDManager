import React from "react";
import { Link, useLocation } from "react-router-dom";
import { SignOutButton, useUser } from "@clerk/clerk-react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import DarkModeToggle from "./DarkModeToggle";
import { AdminOnly } from "./AdminOnly";
import "./Navigation.css";

interface NavigationProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

const Navigation: React.FC<NavigationProps> = ({ isCollapsed, setIsCollapsed }) => {
  const location = useLocation();
  const { user } = useUser();
  const userRole = useQuery(api.users.getUserRole, { 
    clerkId: user?.id || "" 
  });

  const isAdmin = userRole === "admin";
  const isAuthenticated = !!user;

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
              to="/campaigns"
              className={`nav-link ${
                location.pathname.startsWith("/campaigns") ? "active" : ""
              }`}
              title="Campaigns"
            >
              {isCollapsed ? "📚" : "Campaigns"}
            </Link>
            
            <Link
              to="/characters"
              className={`nav-link ${
                location.pathname === "/characters" ? "active" : ""
              }`}
              title="Characters"
            >
              {isCollapsed ? "👥" : "Characters"}
            </Link>
            
            {/* Admin-only navigation items */}
            {isAdmin && (
              <>
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
                  to="/interactions"
                  className={`nav-link ${
                    location.pathname.startsWith("/interactions") ? "active" : ""
                  }`}
                  title="Interactions"
                >
                  {isCollapsed ? "💬" : "Interactions"}
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
                  to="/quests"
                  className={`nav-link ${
                    location.pathname.startsWith("/quests") ? "active" : ""
                  }`}
                  title="Quests"
                >
                  {isCollapsed ? "📜" : "Quests"}
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
                <Link
                  to="/monsters"
                  className={`nav-link ${
                    location.pathname.startsWith("/monsters") ? "active" : ""
                  }`}
                  title="Monsters"
                >
                  {isCollapsed ? "👹" : "Monsters"}
                </Link>
                <Link
                  to="/npcs"
                  className={`nav-link ${
                    location.pathname.startsWith("/npcs") ? "active" : ""
                  }`}
                  title="NPCs"
                >
                  {isCollapsed ? "👤" : "NPCs"}
                </Link>
                <Link
                  to="/factions"
                  className={`nav-link ${
                    location.pathname.startsWith("/factions") ? "active" : ""
                  }`}
                  title="Factions"
                >
                  {isCollapsed ? "🏛️" : "Factions"}
                </Link>
                <Link
                  to="/timeline-events"
                  className={`nav-link ${
                    location.pathname.startsWith("/timeline-events") ? "active" : ""
                  }`}
                  title="Timeline Events"
                >
                  {isCollapsed ? "📅" : "Timeline Events"}
                </Link>
              </>
            )}
            
            {/* Admin-only navigation items */}
            <AdminOnly>
              <div className="nav-separator" />
              <div className="nav-section-title">
                {isCollapsed ? "⚡" : "Admin Tools"}
              </div>
              <Link
                to="/admin/users"
                className={`nav-link ${
                  location.pathname.startsWith("/admin") ? "active" : ""
                }`}
                title="User Management"
              >
                {isCollapsed ? "👥" : "User Management"}
              </Link>
              <Link
                to="/admin/analytics"
                className={`nav-link ${
                  location.pathname.startsWith("/admin/analytics") ? "active" : ""
                }`}
                title="Analytics"
              >
                {isCollapsed ? "📊" : "Analytics"}
              </Link>
            </AdminOnly>
            
            <DarkModeToggle isCollapsed={isCollapsed} />
            {isAuthenticated && (
              <SignOutButton>
                <button className="nav-link sign-out" title="Sign Out">
                  {isCollapsed ? "🚪" : "Sign Out"}
                </button>
              </SignOutButton>
            )}
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navigation;
