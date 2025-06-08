import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Link, useNavigate } from 'react-router-dom';

interface MapsListProps {
  userId: string;
}

export const MapsList = ({ userId }: MapsListProps) => {
  const maps = useQuery(api.maps.getUserMaps, { userId });
  const navigate = useNavigate();

  if (!maps) return <div>Loading...</div>;

  const handleMapClick = (mapId: string) => {
    navigate(`/maps/${mapId}`);
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Your Maps</h2>
        <Link
          to="/maps/new"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Create New Map
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {maps.map((map) => (
          <div
            key={map._id}
            onClick={() => handleMapClick(map._id)}
            className="block p-4 border rounded hover:shadow-lg transition-shadow cursor-pointer"
          >
            <h3 className="text-xl font-semibold mb-2">{map.name}</h3>
            <div className="text-sm text-gray-600">
              <p>Dimensions: {map.width} × {map.height}</p>
              <p>Created: {new Date(map.createdAt).toLocaleDateString()}</p>
              <p>Last Updated: {new Date(map.updatedAt).toLocaleDateString()}</p>
            </div>
          </div>
        ))}
      </div>

      {maps.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No maps created yet. Click "Create New Map" to get started!
        </div>
      )}
    </div>
  );
}; 