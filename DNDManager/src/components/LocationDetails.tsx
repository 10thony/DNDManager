import React from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useParams, Link } from "react-router-dom";
import { Id } from "../../convex/_generated/dataModel";
import { useAuth } from "@clerk/clerk-react";
import "./LocationForm.css";

type CellState = 'inbounds' | 'outbounds' | 'occupied';

const CELL_COLORS = {
  inbounds: 'bg-green-500',
  outbounds: 'bg-red-500',
  occupied: 'bg-blue-500',
};

const DEFAULT_CELL_SIZE = 20; // Smaller cell size for preview

interface MapPreviewProps {
  map: {
    width: number;
    height: number;
    cells: Array<{
      x: number;
      y: number;
      state: CellState;
    }>;
  };
}

const MapPreview: React.FC<MapPreviewProps> = ({ map }) => {
  return (
    <div 
      className="map-preview-grid"
      style={{
        gridTemplateColumns: `repeat(${map.width}, ${DEFAULT_CELL_SIZE}px)`,
        width: 'fit-content',
      }}
    >
      {map.cells.map((cell) => (
        <div
          key={`${cell.x}-${cell.y}`}
          className={`map-preview-cell ${cell.state}`}
          style={{
            width: DEFAULT_CELL_SIZE,
            height: DEFAULT_CELL_SIZE,
          }}
        />
      ))}
    </div>
  );
};

export default function LocationDetails() {
  const { userId } = useAuth();
  const { locationId } = useParams();
  const location = useQuery(api.locations.get, { id: locationId as Id<"locations"> });
  const maps = useQuery(api.maps.getUserMaps, { userId: userId || "" }) || [];

  if (!location) {
    return <div>Loading...</div>;
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