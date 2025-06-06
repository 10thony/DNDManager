import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import CharacterCreationForm from "./components/CharacterCreationForm";
import CharacterList from "./components/CharacterList";
import CharacterDetail from "./components/CharacterDetail";
import Navigation from "./components/Navigation";
import ItemsPage from "./components/ItemCreationForm"
import ItemDetails from "./components/ItemDetails";
import ItemList from "./components/ItemList";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL);

const App: React.FC = () => {
  return (
    <ConvexProvider client={convex}>
      <Router>
        <div className="app">
          <Navigation />
          <main className="main-content">
            <Routes>
              <Route path="/newItem" element={<ItemCreationWrapper />} />
              <Route path="/items" element={<ItemList />} />
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

export default App;
