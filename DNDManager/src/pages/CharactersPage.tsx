import React from "react";
import { Link } from "react-router-dom";
import CharacterList from "../components/CharacterList";

const CharactersPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">
              D&D Characters
            </h1>
            <Link
              to="/create-character"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Create New Character
            </Link>
          </div>
          <CharacterList />
        </div>
      </div>
    </div>
  );
};

export default CharactersPage;
