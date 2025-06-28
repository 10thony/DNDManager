import React from 'react';

type CellState = 'inbounds' | 'outbounds' | 'occupied';

const CELL_COLORS = {
  inbounds: 'bg-green-500',
  outbounds: 'bg-red-500',
  occupied: 'bg-blue-500',
};

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
  cellSize?: number;
  interactive?: boolean;
  onCellClick?: (x: number, y: number) => void;
  className?: string;
}

export const MapPreview: React.FC<MapPreviewProps> = ({ 
  map, 
  cellSize = 20, 
  interactive = false,
  onCellClick,
  className = ""
}) => {
  return (
    <div 
      className={`map-preview-grid ${className}`}
      style={{
        gridTemplateColumns: `repeat(${map.width}, ${cellSize}px)`,
        width: 'fit-content',
        gap: '1px',
      }}
    >
      {map.cells.map((cell) => (
        <div
          key={`${cell.x}-${cell.y}`}
          className={`map-preview-cell ${CELL_COLORS[cell.state]} ${
            interactive ? 'cursor-pointer hover:opacity-80 transition-colors duration-150' : ''
          }`}
          style={{
            width: cellSize,
            height: cellSize,
          }}
          onClick={() => interactive && onCellClick && onCellClick(cell.x, cell.y)}
        />
      ))}
    </div>
  );
}; 