import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import CharacterCreationForm from "./components/CharacterCreationForm";
import CharacterList from "./components/CharacterList";
import CharacterDetail from "./components/CharacterDetail";
import Navigation from "./components/Navigation";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL);

const App: React.FC = () => {
  return (
    <ConvexProvider client={convex}>
      <Router>
        <div className="app">
          <Navigation />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Navigate to="/characters" replace />} />
              <Route path="/characters" element={<CharacterList />} />
              <Route path="/characters/:id" element={<CharacterDetail />} />
              <Route path="/create-character" element={<CharacterCreationForm />} />
            </Routes>
          </main>
        </div>
      </Router>
    </ConvexProvider>
  );
};

export default App;
