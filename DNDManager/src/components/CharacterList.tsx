import React from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import CharacterCard from "./CharacterCard";
import { useNavigate } from "react-router-dom";

const CharacterList: React.FC = () => {
  const characters = useQuery(api.characters.getAllCharacters);
  const navigate = useNavigate();

  if (characters === undefined) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (characters.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg mb-4">
          No characters created yet
        </div>
        <button
          onClick={() => navigate("/create-character")}
          className="px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Create Your First Character
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Your Characters ({characters.length})
        </h2>
        <button
          onClick={() => navigate("/create-character")}
          className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Create New Character
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {characters.map((character) => (
          <CharacterCard
            key={character._id}
            character={character}
            onClick={() => navigate(`/characters/${character._id}`)}
          />
        ))}
      </div>
    </div>
  );
};

export default CharacterList;
