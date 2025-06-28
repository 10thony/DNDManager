import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import CharacterForm from "./CharacterForm";

const NPCCreationForm: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get('returnTo');

  const handleCancel = () => {
    if (returnTo === 'campaign-form') {
      navigate("/campaigns/new");
    } else {
      navigate("/npcs");
    }
  };

  return (
    <div className="npc-creation-form">
      <div className="form-header">
        <h1>Create New NPC</h1>
        <button onClick={handleCancel} className="btn btn-secondary">
          {returnTo === 'campaign-form' ? "Back to Campaign Form" : "Cancel"}
        </button>
      </div>
      <CharacterForm defaultCharacterType="NonPlayerCharacter" />
    </div>
  );
};

export default NPCCreationForm; 