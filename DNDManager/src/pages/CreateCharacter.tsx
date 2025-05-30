import React from "react";
import { useNavigate } from "react-router-dom";
import CharacterForm from "../components/CharacterForm";

const CreateCharacter: React.FC = () => {
  const navigate = useNavigate();

  const handleSuccess = () => {
    // Navigate to characters list after successful creation
    navigate("/characters");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <button
            onClick={() => navigate("/characters")}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Back to Characters
          </button>
        </div>
        <CharacterForm onSuccess={handleSuccess} />
      </div>
    </div>
  );
};

export default CreateCharacter;
