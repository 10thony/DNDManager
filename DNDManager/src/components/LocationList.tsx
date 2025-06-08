import React from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Link } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";

export default function LocationList() {
  const { userId } = useAuth();
  const locations = useQuery(api.locations.list) || [];
  const maps = useQuery(api.maps.getUserMaps, { userId: userId || "" }) || [];

  const getMapName = (mapId: string) => {
    const map = maps.find(m => m._id === mapId);
    return map ? map.name : "Unknown Map";
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Locations</h2>
        <Link
          to="/locations/new"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Create New Location
        </Link>
      </div>
      <div className="grid gap-4">
        {locations.map((location) => (
          <Link
            key={location._id}
            to={`/locations/${location._id}`}
            className="block border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-semibold">{location.name}</h3>
                <p className="text-gray-600">{location.type}</p>
              </div>
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                {location.type}
              </span>
            </div>
            <p className="mt-2 text-gray-700">{location.description}</p>
            {location.mapId && (
              <div className="mt-2">
                <h4 className="font-medium">Associated Map:</h4>
                <p className="text-gray-600">{getMapName(location.mapId)}</p>
              </div>
            )}
            {location.notableNpcIds.length > 0 && (
              <div className="mt-2">
                <h4 className="font-medium">Notable NPCs:</h4>
                <ul className="list-disc list-inside">
                  {location.notableNpcIds.map((npcId) => (
                    <li key={npcId} className="text-gray-600">
                      {npcId} {/* Replace with actual NPC name when available */}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {location.secrets && (
              <div className="mt-2">
                <h4 className="font-medium">Secrets:</h4>
                <p className="text-gray-600">{location.secrets}</p>
              </div>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
} 