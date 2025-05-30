import React from "react";
import CharacterList from "../components/CharacterList";

const Characters: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <CharacterList />
    </div>
  );
};

export default Characters;
