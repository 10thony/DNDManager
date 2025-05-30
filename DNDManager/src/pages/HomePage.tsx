import React from "react";
import { Link } from "react-router-dom";

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md mx-auto text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-6">
          D&D Character Manager
        </h1>
        <p className="text-gray-600 mb-8">
          Create and manage your D&D 5E characters with ease.
        </p>
        <div className="space-y-4">
          <Link
            to="/create-character"
            className="block w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Create New Character
          </Link>
          <Link
            to="/characters"
            className="block w-full bg-gray-600 text-white py-3 px-6 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            View All Characters
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
