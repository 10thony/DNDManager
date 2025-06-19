import React from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Link } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import "./LocationForm.css";

export default function LocationList() {
  const { userId } = useAuth();
  const locations = useQuery(api.locations.list) || [];
  const maps = useQuery(api.maps.getUserMaps, { userId: userId || "" }) || [];

  const getMapName = (mapId: string) => {
    const map = maps.find(m => m._id === mapId);
    return map ? map.name : "Unknown Map";
  };

  return (
    <div className="location-container">
      <div className="location-list-header">
        <h2 className="location-list-title">Locations</h2>
        <Link
          to="/locations/new"
          className="location-create-btn"
        >
          Create New Location
        </Link>
      </div>
      <div className="location-grid">
        {locations.map((location) => (
          <Link
            key={location._id}
            to={`/locations/${location._id}`}
            className="location-card"
          >
            <div className="location-card-header">
              <h3 className="location-name">{location.name}</h3>
              <span className="location-type-badge">
                {location.type}
              </span>
            </div>
            <p className="location-description">{location.description}</p>
            <div className="location-details">
              {location.mapId && (
                <div className="location-detail-item">
                  <span className="location-detail-label">Map:</span>
                  <span className="location-detail-value">{getMapName(location.mapId)}</span>
                </div>
              )}
              {location.notableNpcIds.length > 0 && (
                <div className="location-detail-item">
                  <span className="location-detail-label">NPCs:</span>
                  <ul className="location-npcs-list">
                    {location.notableNpcIds.map((npcId) => (
                      <li key={npcId} className="location-npc-item">
                        {npcId} {/* Replace with actual NPC name when available */}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {location.secrets && (
                <div className="location-detail-item">
                  <span className="location-detail-label">Secrets:</span>
                  <span className="location-detail-value">{location.secrets}</span>
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
} 