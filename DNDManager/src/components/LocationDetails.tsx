import React from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useParams, Link } from "react-router-dom";
import { Id } from "../../convex/_generated/dataModel";
import { useAuth } from "@clerk/clerk-react";

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
      className="grid gap-0.5 p-2 transition-all duration-200"
      style={{
        gridTemplateColumns: `repeat(${map.width}, ${DEFAULT_CELL_SIZE}px)`,
        width: 'fit-content',
      }}
    >
      {map.cells.map((cell) => (
        <div
          key={`${cell.x}-${cell.y}`}
          className={`${CELL_COLORS[cell.state]} transition-colors duration-150`}
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
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">{location.name}</h2>
        <div className="flex gap-2">
          <Link
            to={`/locations/${locationId}/edit`}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Edit Location
          </Link>
          <Link
            to="/locations"
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Back to Locations
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Location Details</h3>
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="mb-2"><span className="font-medium">Type:</span> {location.type}</p>
              <p className="mb-2"><span className="font-medium">Description:</span></p>
              <p className="text-gray-700">{location.description}</p>
            </div>
          </div>

          {location.secrets && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Secrets</h3>
              <div className="bg-white p-4 rounded-lg shadow">
                <p className="text-gray-700">{location.secrets}</p>
              </div>
            </div>
          )}

          {location.notableNpcIds.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Notable NPCs</h3>
              <div className="bg-white p-4 rounded-lg shadow">
                <ul className="list-disc list-inside">
                  {location.notableNpcIds.map((npcId: Id<"npcs">) => (
                    <li key={npcId} className="text-gray-600">
                      {npcId} {/* Replace with actual NPC name when available */}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Map</h3>
          {associatedMap ? (
            <div className="bg-white p-4 rounded-lg shadow">
              <h4 className="font-medium mb-2">{associatedMap.name}</h4>
              <div className="aspect-square bg-gray-100 rounded overflow-auto">
                <div className="flex justify-center items-center p-4">
                  <MapPreview map={associatedMap} />
                </div>
              </div>
              <div className="mt-2 text-sm text-gray-600">
                <p>Dimensions: {associatedMap.width} × {associatedMap.height}</p>
                <p>Last Updated: {new Date(associatedMap.updatedAt).toLocaleDateString()}</p>
              </div>
              <Link
                to={`/maps/${associatedMap._id}`}
                className="mt-2 inline-block text-blue-500 hover:text-blue-600"
              >
                View Full Map
              </Link>
            </div>
          ) : (
            <div className="bg-white p-4 rounded-lg shadow text-center">
              <p className="text-gray-500">No map associated with this location</p>
              <Link
                to="/maps/new"
                className="mt-2 inline-block bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Create New Map
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 