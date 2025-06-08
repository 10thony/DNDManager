import { useAuth } from '@clerk/clerk-react';
import { Routes, Route, Navigate, useParams } from 'react-router-dom';
import { MapsList } from '../components/maps/MapsList';
import { MapCreator } from '../components/maps/MapCreator';

const MapCreatorWithParams = ({ userId }: { userId: string }) => {
  const { mapId } = useParams();
  return <MapCreator userId={userId} mapId={mapId} />;
};

export const Maps = () => {
  const { userId, isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  if (!isSignedIn) {
    return <Navigate to="/sign-in" replace />;
  }

  return (
    <Routes>
      <Route path="/" element={<MapsList userId={userId!} />} />
      <Route path="/new" element={<MapCreator userId={userId!} />} />
      <Route path="/:mapId" element={<MapCreatorWithParams userId={userId!} />} />
    </Routes>
  );
}; 