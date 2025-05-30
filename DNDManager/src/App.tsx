import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import HomePage from "./pages/HomePage";
import CreateCharacterPage from "./pages/CreateCharacterPage";
import CharactersPage from "./pages/CharactersPage";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

function App() {
  return (
    <ConvexProvider client={convex}>
      <Router>
        <CreateCharacterPage />
      </Router>
    </ConvexProvider>
  );
}

export default App;
