import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ConvexProvider, ConvexReactClient, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import CharacterList from "./components/CharacterList";
import CharacterDetail from "./components/CharacterDetail";
import Navigation from "./components/Navigation";
import ItemDetails from "./components/ItemDetails";
import ItemList from "./components/ItemList";
import { Id } from "../convex/_generated/dataModel";
import { ClerkProvider, SignedIn, SignedOut, RedirectToSignIn, useUser } from '@clerk/clerk-react';
import { Maps } from "./pages/Maps";
import LocationList from "./components/LocationList";
import LocationDetails from "./components/LocationDetails";
import ActionsList from "./components/ActionsList";
import QuestList from "./components/QuestList";
import QuestDetail from "./components/QuestDetail";
import QuestTaskCreationForm from "./components/QuestTaskCreationForm";
import MonsterList from "./components/MonsterList";
import MonsterDetail from "./components/MonsterDetail";
import InteractionList from "./components/InteractionList";
import InteractionDetail from "./components/InteractionDetail";
import NPCsList from "./components/NPCsList";
import FactionList from "./components/FactionList";
import FactionDetail from "./components/FactionDetail";
import FactionCreationForm from "./components/FactionCreationForm";
import TimelineEventList from "./components/TimelineEventList";
import TimelineEventDetail from "./components/TimelineEventDetail";
import CampaignList from "./components/campaigns/CampaignList";
import CampaignDetail from "./components/campaigns/CampaignDetail";
import CampaignCreationForm from "./components/campaigns/CampaignCreationForm";
import AdminUsers from "./pages/AdminUsers";
import { UserSync } from "./components/UserSync";
import { UserDebug } from "./components/UserDebug";
import { DarkModeProvider } from "./contexts/DarkModeContext";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import { AdminOnly } from "./components/AdminOnly";
import CharacterForm from "./components/CharacterForm";
import NPCCreationForm from "./components/NPCCreationForm";
import QuestCreationForm from "./components/QuestCreationForm";
import LocationForm from "./components/LocationForm";
import MonsterForm from "./components/MonsterForm";
import { MapCreator } from "./components/maps/MapCreator";
import { SessionManager } from "./components/SessionManager";
import { SessionTest } from "./components/SessionTest";

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

// Admin-only route wrapper component
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ProtectedRoute>
      <AdminOnly>
        {children}
      </AdminOnly>
    </ProtectedRoute>
  );
};

// Role-based redirect component
const RoleBasedRedirect: React.FC = () => {
  const { user } = useUser();
  const userRole = useQuery(api.users.getUserRole, 
    user?.id ? { clerkId: user.id } : "skip"
  );

  if (!user || !userRole) {
    return <div className="loading">Loading...</div>;
  }

  // Non-admin users are redirected to campaigns
  if (userRole !== "admin") {
    return <Navigate to="/campaigns" replace />;
  }

  // Admin users are redirected to characters (original behavior)
  return <Navigate to="/characters" replace />;
};

const App: React.FC = () => {
  const [navCollapsed, setNavCollapsed] = useState(false);

  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <ConvexProvider client={convex}>
        <DarkModeProvider>
          <SessionManager>
            <UserSync />
            <UserDebug />
            <Router>
              <div className="app">
                <Navigation isCollapsed={navCollapsed} setIsCollapsed={setNavCollapsed} />
                <main className={`main-content${navCollapsed ? " collapsed" : ""}`}>
                <Routes>
                  <Route path="/sign-in" element={<SignIn />} />
                  <Route path="/sign-up" element={<SignUp />} />
                  
                  {/* Campaign routes - accessible to all authenticated users */}
                  <Route path="/campaigns" element={
                    <ProtectedRoute>
                      <CampaignList />
                    </ProtectedRoute>
                  } />
                  <Route path="/campaigns/:id" element={
                    <ProtectedRoute>
                      <CampaignDetail />
                    </ProtectedRoute>
                  } />
                  <Route path="/campaigns/:id/edit" element={
                    <ProtectedRoute>
                      <CampaignCreationForm />
                    </ProtectedRoute>
                  } />
                  <Route path="/campaigns/new" element={
                    <ProtectedRoute>
                      <CampaignCreationForm />
                    </ProtectedRoute>
                  } />
                  
                  {/* Creation forms - accessible to all authenticated users */}
                  <Route path="/characters/new" element={
                    <ProtectedRoute>
                      <CharacterCreationWrapper />
                    </ProtectedRoute>
                  } />
                  <Route path="/npcs/new" element={
                    <ProtectedRoute>
                      <NPCCreationWrapper />
                    </ProtectedRoute>
                  } />
                  <Route path="/quests/new" element={
                    <ProtectedRoute>
                      <QuestCreationWrapper />
                    </ProtectedRoute>
                  } />
                  <Route path="/locations/new" element={
                    <ProtectedRoute>
                      <LocationCreationWrapper />
                    </ProtectedRoute>
                  } />
                  <Route path="/monsters/new" element={
                    <ProtectedRoute>
                      <MonsterCreationWrapper />
                    </ProtectedRoute>
                  } />
                  <Route path="/maps/new" element={
                    <ProtectedRoute>
                      <MapCreationWrapper />
                    </ProtectedRoute>
                  } />
                  
                  {/* Character routes - accessible to all authenticated users */}
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
                  
                  {/* Admin-only routes */}
                  <Route path="/maps/*" element={
                    <AdminRoute>
                      <Maps />
                    </AdminRoute>
                  } />
                  <Route path="/items" element={
                    <AdminRoute>
                      <ItemList />
                    </AdminRoute>
                  } />
                  <Route path="/items/:id" element={
                    <AdminRoute>
                      <ItemDetailsWrapper />
                    </AdminRoute>
                  } />
                  <Route path="/locations" element={
                    <AdminRoute>
                      <LocationList />
                    </AdminRoute>
                  } />
                  <Route path="/locations/:locationId" element={
                    <AdminRoute>
                      <LocationDetails />
                    </AdminRoute>
                  } />
                  <Route path="/actions" element={
                    <AdminRoute>
                      <ActionsList />
                    </AdminRoute>
                  } />
                  <Route path="/interactions" element={
                    <AdminRoute>
                      <InteractionList />
                    </AdminRoute>
                  } />
                  <Route path="/interactions/:id" element={
                    <AdminRoute>
                      <InteractionDetailWrapper />
                    </AdminRoute>
                  } />
                  <Route path="/quests" element={
                    <AdminRoute>
                      <QuestList />
                    </AdminRoute>
                  } />
                  <Route path="/quests/:questId" element={
                    <AdminRoute>
                      <QuestDetail />
                    </AdminRoute>
                  } />
                  <Route path="/quests/:questId/tasks/new" element={
                    <AdminRoute>
                      <QuestTaskCreationForm />
                    </AdminRoute>
                  } />
                  <Route path="/monsters" element={
                    <AdminRoute>
                      <MonsterList />
                    </AdminRoute>
                  } />
                  <Route path="/monsters/:id" element={
                    <AdminRoute>
                      <MonsterDetail />
                    </AdminRoute>
                  } />
                  <Route path="/npcs" element={
                    <AdminRoute>
                      <NPCsList />
                    </AdminRoute>
                  } />
                  <Route path="/factions" element={
                    <AdminRoute>
                      <FactionList />
                    </AdminRoute>
                  } />
                  <Route path="/factions/new" element={
                    <AdminRoute>
                      <FactionCreationForm />
                    </AdminRoute>
                  } />
                  <Route path="/factions/:factionId" element={
                    <AdminRoute>
                      <FactionDetail />
                    </AdminRoute>
                  } />
                  <Route path="/timeline-events" element={
                    <AdminRoute>
                      <TimelineEventList />
                    </AdminRoute>
                  } />
                  <Route path="/timeline-events/:id" element={
                    <AdminRoute>
                      <TimelineEventDetailWrapper />
                    </AdminRoute>
                  } />
                  <Route path="/admin/users" element={
                    <AdminRoute>
                      <AdminUsers />
                    </AdminRoute>
                  } />
                  
                  {/* Session test route - accessible to all authenticated users */}
                  <Route path="/session-test" element={
                    <ProtectedRoute>
                      <SessionTest />
                    </ProtectedRoute>
                  } />
                  
                  {/* Root route with role-based redirect */}
                  <Route path="/" element={
                    <ProtectedRoute>
                      <RoleBasedRedirect />
                    </ProtectedRoute>
                  } />
                </Routes>
              </main>
            </div>
          </Router>
          </SessionManager>
        </DarkModeProvider>
      </ConvexProvider>
    </ClerkProvider>
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

// Wrapper component to handle interaction details
const InteractionDetailWrapper: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  return <InteractionDetail interactionId={id as Id<"interactions">} />;
};

// Wrapper component to handle timeline event detail
const TimelineEventDetailWrapper: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  return <TimelineEventDetail timelineEventId={id as Id<"timelineEvents">} />;
};

// Wrapper component for character creation
const CharacterCreationWrapper: React.FC = () => {
  return <CharacterForm defaultCharacterType="PlayerCharacter" />;
};

// Wrapper component for NPC creation
const NPCCreationWrapper: React.FC = () => {
  return <NPCCreationForm />;
};

// Wrapper component for quest creation
const QuestCreationWrapper: React.FC = () => {
  return <QuestCreationForm />;
};

// Wrapper component for location creation
const LocationCreationWrapper: React.FC = () => {
  return <LocationForm />;
};

// Wrapper component for monster creation
const MonsterCreationWrapper: React.FC = () => {
  return <MonsterForm onSubmitSuccess={() => {}} onCancel={() => {}} />;
};

// Wrapper component for map creation
const MapCreationWrapper: React.FC = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get('returnTo');

  const handleMapCreated = () => {
    if (returnTo === 'location-form') {
      navigate("/locations/new?returnTo=campaign-form");
    } else {
      navigate("/maps");
    }
  };

  if (!user?.id) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className="map-creation-header" style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: '1rem', 
        borderBottom: '1px solid #e5e7eb',
        marginBottom: '1rem'
      }}>
        <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold' }}>Create New Map</h2>
        <button 
          onClick={() => {
            if (returnTo === 'location-form') {
              navigate("/locations/new?returnTo=campaign-form");
            } else {
              navigate("/maps");
            }
          }}
          className="btn-secondary"
        >
          {returnTo === 'location-form' ? "Back to Location Form" : "Cancel"}
        </button>
      </div>
      <MapCreator userId={user.id} onMapCreated={handleMapCreated} />
    </div>
  );
};

export default App;
