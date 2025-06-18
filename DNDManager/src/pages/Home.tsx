import React from "react";
import { useNavigate } from "react-router-dom";

const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md mx-auto text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-6">
          D&D Character Manager
        </h1>
        <p className="text-gray-600 mb-8">
          Create and manage your D&D 5E characters with ease
        </p>
        <div className="space-y-4">
          <button
            onClick={() => navigate("/characters")}
            className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            View Characters
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
