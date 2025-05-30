import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import Home from "./pages/Home";
import CreateCharacter from "./pages/CreateCharacter";
import Characters from "./pages/Characters";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

function App() {
  return (
    <ConvexProvider client={convex}>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/create-character" element={<CreateCharacter />} />
            <Route path="/characters" element={<Characters />} />
            <Route path="/characters/:id" element={<Characters />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </ConvexProvider>
  );
}

export default App;
