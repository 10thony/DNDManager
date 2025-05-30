import React from "react";
import { useNavigate } from "react-router-dom";
import CharacterForm from "../components/CharacterForm";

const CreateCharacterPage: React.FC = () => {
  const navigate = useNavigate();

  const handleSuccess = () => {
    // Navigate to characters list after successful creation
    navigate("/characters");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <CharacterForm onSuccess={handleSuccess} />
      </div>
    </div>
  );
};

export default CreateCharacterPage;
