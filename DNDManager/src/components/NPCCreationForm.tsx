import React from "react";
import { useNavigate } from "react-router-dom";
import CharacterCreationForm from "./CharacterCreationForm";

const NPCCreationForm: React.FC = () => {
  const navigate = useNavigate();

  const handleCancel = () => {
    navigate("/npcs");
  };

  return (
    <div className="npc-creation-form">
      <div className="form-header">
        <h1>Create New NPC</h1>
        <button onClick={handleCancel} className="btn btn-secondary">
          Cancel
        </button>
      </div>
      <CharacterCreationForm defaultCharacterType="NonPlayerCharacter" />
    </div>
  );
};

export default NPCCreationForm; 