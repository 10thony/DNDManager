// import React from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useParams, Link } from "react-router-dom";
import { Id } from "../../convex/_generated/dataModel";
import { useAuth } from "@clerk/clerk-react";
import { MapPreview } from "./maps/MapPreview";
import "./LocationForm.css";

export default function LocationDetails() {
  const { userId } = useAuth();
  const { locationId } = useParams();
  const location = useQuery(api.locations.get, { id: locationId as Id<"locations"> });
  const maps = useQuery(api.maps.getUserMaps, userId ? { clerkId: userId } : "skip") || [];

  if (location === undefined) {
    return (
      <div className="location-details-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading location details...</p>
        </div>
      </div>
    );
  }

  if (location === null) {
    return (
      <div className="location-details-container">
        <div className="error-state">
          <h2>Location Not Found</h2>
          <p>The location you're looking for doesn't exist.</p>
          <Link to="/locations" className="btn-primary">
            Back to Locations
          </Link>
        </div>
      </div>
    );
  }

  const associatedMap = location.mapId ? maps.find(m => m._id === location.mapId) : null;

  return (
    <div className="location-details-container">
      <div className="location-details-header">
        <h2 className="location-details-title">{location.name}</h2>
        <div className="location-details-actions">
          <Link
            to={`/locations/${locationId}/edit`}
            className="btn-primary"
          >
            Edit Location
          </Link>
          <Link
            to="/locations"
            className="btn-secondary"
          >
            Back to Locations
          </Link>
        </div>
      </div>

      <div className="location-details-grid">
        <div className="location-info-section">
          <h3 className="location-info-title">Location Details</h3>
          <div className="location-info-content">
            <p className="location-detail-item">
              <span className="location-info-label">Type:</span>
              <span className="location-detail-value">{location.type}</span>
            </p>
            <p className="location-detail-item">
              <span className="location-info-label">Description:</span>
            </p>
            <p className="location-detail-value">{location.description}</p>
          </div>
        </div>

        <div className="location-info-section">
          <h3 className="location-info-title">Map</h3>
          {associatedMap ? (
            <div className="location-info-content">
              <h4 className="location-info-label">{associatedMap.name}</h4>
              <div className="map-preview-container">
                <div className="flex justify-center items-center p-4">
                  <MapPreview map={associatedMap} />
                </div>
              </div>
              <div className="map-info">
                <p>Dimensions: {associatedMap.width} × {associatedMap.height}</p>
                <p>Last Updated: {new Date(associatedMap.updatedAt).toLocaleDateString()}</p>
              </div>
              <Link
                to={`/maps/${associatedMap._id}`}
                className="map-link"
              >
                View Full Map
              </Link>
            </div>
          ) : (
            <div className="no-map-container">
              <p>No map associated with this location</p>
              <Link
                to="/maps/new"
                className="create-map-btn"
              >
                Create New Map
              </Link>
            </div>
          )}
        </div>

        {location.secrets && (
          <div className="location-info-section">
            <h3 className="location-info-title">Secrets</h3>
            <div className="location-info-content">
              <p>{location.secrets}</p>
            </div>
          </div>
        )}

        {location.notableNpcIds.length > 0 && (
          <div className="location-info-section">
            <h3 className="location-info-title">Notable NPCs</h3>
            <div className="location-info-content">
              <ul className="location-npcs-list">
                {location.notableNpcIds.map((npcId: Id<"npcs">) => (
                  <li key={npcId} className="location-npc-item">
                    {npcId} {/* Replace with actual NPC name when available */}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 