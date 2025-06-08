import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useParams } from "react-router-dom";
import { ConvexProvider, ConvexReactClient, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import CharacterCreationForm from "./components/CharacterCreationForm";
import CharacterList from "./components/CharacterList";
import CharacterDetail from "./components/CharacterDetail";
import Navigation from "./components/Navigation";
import ItemsPage from "./components/ItemCreationForm"
import ItemDetails from "./components/ItemDetails";
import ItemList from "./components/ItemList";
import { Id } from "../convex/_generated/dataModel";
import { ClerkProvider, SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';
import { Maps } from "./pages/Maps";
import LocationList from "./components/LocationList";
import LocationForm from "./components/LocationForm";
import LocationDetails from "./components/LocationDetails";
import AppInitializer from "./components/AppInitializer";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL);
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error('Missing Publishable Key')
}

// Protected Route wrapper component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <>
      <SignedIn>
        {children}
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
};

const App: React.FC = () => {
  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <ConvexProvider client={convex}>
        <AppInitializer />
        <Router>
          <div className="app">
            <Navigation />
            <main className="main-content">
              <Routes>
                <Route path="/maps/*" element={
                  <ProtectedRoute>
                    <Maps />
                  </ProtectedRoute>
                } />
                <Route path="/newItem" element={
                  <ProtectedRoute>
                    <ItemCreationWrapper />
                  </ProtectedRoute>
                } />
                <Route path="/items" element={
                  <ProtectedRoute>
                    <ItemList />
                  </ProtectedRoute>
                } />
                <Route path="/items/:id" element={
                  <ProtectedRoute>
                    <ItemDetailsWrapper />
                  </ProtectedRoute>
                } />
                <Route path="/characters" element={
                  <ProtectedRoute>
                    <CharacterList />
                  </ProtectedRoute>
                } />
                <Route path="/characters/:id" element={
                  <ProtectedRoute>
                    <CharacterDetail />
                  </ProtectedRoute>
                } />
                <Route path="/create-character" element={
                  <ProtectedRoute>
                    <CharacterCreationForm />
                  </ProtectedRoute>
                } />
                <Route path="/locations" element={
                  <ProtectedRoute>
                    <LocationList />
                  </ProtectedRoute>
                } />
                <Route path="/locations/new" element={
                  <ProtectedRoute>
                    <LocationForm />
                  </ProtectedRoute>
                } />
                <Route path="/locations/:locationId" element={
                  <ProtectedRoute>
                    <LocationDetails />
                  </ProtectedRoute>
                } />
                <Route path="/" element={<Navigate to="/characters" replace />} />
              </Routes>
            </main>
          </div>
        </Router>
      </ConvexProvider>
    </ClerkProvider>
  );
};

// Wrapper component to handle navigation
const ItemCreationWrapper: React.FC = () => {
  const navigate = useNavigate();

  const handleSubmitSuccess = (itemId: string) => {
    // Navigate to the item details page or items list
    navigate(`/items/${itemId}`);
  };

  const handleCancel = () => {
    // Navigate back to the items list
    navigate("/items");
  };

  return (
    <ItemsPage 
      onSubmitSuccess={handleSubmitSuccess}
      onCancel={handleCancel}
    />
  );
};

// Wrapper component to handle location creation
const LocationCreationWrapper: React.FC = () => {
  const navigate = useNavigate();

  const handleSubmitSuccess = () => {
    // Navigate to the locations list
    navigate("/locations");
  };

  const handleCancel = () => {
    // Navigate back to the locations list
    navigate("/locations");
  };

  return (
    <LocationForm 
      onSubmitSuccess={handleSubmitSuccess}
      onCancel={handleCancel}
    />
  );
};

// Wrapper component to handle item details
const ItemDetailsWrapper: React.FC = () => {
  const { id } = useParams();
  const item = useQuery(api.items.getItem, { itemId: id as Id<"items"> });

  if (!item) {
    return <div className="loading">Loading item details...</div>;
  }

  return <ItemDetails item={item} />;
};

export default App;
