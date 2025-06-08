import { useState, useEffect } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Id } from '../../../convex/_generated/dataModel';

interface MapCreatorProps {
  userId: string;
  mapId?: string;
}

type CellState = 'inbounds' | 'outbounds' | 'occupied';

const CELL_COLORS = {
  inbounds: 'bg-green-500',
  outbounds: 'bg-red-500',
  occupied: 'bg-blue-500',
};

export const MapCreator = ({ userId, mapId }: MapCreatorProps) => {
  const [selectedState, setSelectedState] = useState<CellState>('inbounds');
  const [isCreating, setIsCreating] = useState(!mapId);
  const [mapName, setMapName] = useState('');
  const [width, setWidth] = useState(10);
  const [height, setHeight] = useState(10);

  const createMap = useMutation(api.maps.createMap);
  const updateMapCells = useMutation(api.maps.updateMapCells);
  const deleteMap = useMutation(api.maps.deleteMap);
  const map = useQuery(api.maps.getMap, mapId ? { mapId: mapId as Id<"maps"> } : 'skip');

  // Update form state when map is loaded
  useEffect(() => {
    if (map) {
      setMapName(map.name);
      setWidth(map.width);
      setHeight(map.height);
      setIsCreating(false);
    }
  }, [map]);

  const handleCreateMap = async () => {
    if (!mapName || width <= 0 || height <= 0) return;
    
    try {
      await createMap({
        name: mapName,
        width,
        height,
        userId,
      });
      setIsCreating(false);
    } catch (error) {
      console.error('Failed to create map:', error);
    }
  };

  const handleCellClick = async (x: number, y: number) => {
    if (!map) return;

    const newCells = map.cells.map(cell => 
      cell.x === x && cell.y === y
        ? { ...cell, state: selectedState }
        : cell
    );

    try {
      await updateMapCells({
        mapId: map._id,
        cells: newCells,
      });
    } catch (error) {
      console.error('Failed to update cell:', error);
    }
  };

  if (isCreating) {
    return (
      <div className="p-4">
        <h2 className="text-2xl font-bold mb-4">Create New Map</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Map Name</label>
            <input
              type="text"
              value={mapName}
              onChange={(e) => setMapName(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Width</label>
              <input
                type="number"
                min="1"
                max="30"
                value={width}
                onChange={(e) => setWidth(Math.min(30, Math.max(1, parseInt(e.target.value) || 1)))}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Height</label>
              <input
                type="number"
                min="1"
                max="30"
                value={height}
                onChange={(e) => setHeight(Math.min(30, Math.max(1, parseInt(e.target.value) || 1)))}
                className="w-full p-2 border rounded"
              />
            </div>
          </div>
          <button
            onClick={handleCreateMap}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Create Map
          </button>
        </div>
      </div>
    );
  }

  if (!map) return <div>Loading...</div>;

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">{map.name}</h2>
        <div className="space-x-2">
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value as CellState)}
            className="p-2 border rounded"
          >
            <option value="inbounds">Inbounds</option>
            <option value="outbounds">Outbounds</option>
            <option value="occupied">Occupied</option>
          </select>
          <button
            onClick={() => deleteMap({ mapId: map._id })}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Delete Map
          </button>
        </div>
      </div>

      <div 
        className="grid gap-1"
        style={{
          gridTemplateColumns: `repeat(${map.width}, minmax(0, 1fr))`,
        }}
      >
        {map.cells.map((cell) => (
          <div
            key={`${cell.x}-${cell.y}`}
            className={`aspect-square cursor-pointer ${CELL_COLORS[cell.state]} hover:opacity-80`}
            onClick={() => handleCellClick(cell.x, cell.y)}
          />
        ))}
      </div>
    </div>
  );
}; 