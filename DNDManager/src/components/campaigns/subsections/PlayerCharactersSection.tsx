import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { useUser } from "@clerk/clerk-react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import EntitySelectionModal from "../../modals/EntitySelectionModal";
import "./PlayerCharactersSection.css";

interface PlayerCharactersSectionProps {
  campaignId: Id<"campaigns">;
  playerCharacterIds?: Id<"playerCharacters">[];
  onUpdate: () => void;
}

type ModalType = "entitySelection" | null;

const PlayerCharactersSection: React.FC<PlayerCharactersSectionProps> = ({
  campaignId,
  playerCharacterIds = [],
  onUpdate,
}) => {
  const { user } = useUser();
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const playerCharacters = useQuery(api.characters.getAllCharacters);
  const updateCampaign = useMutation(api.campaigns.updateCampaign);

  const campaignPlayerCharacters = playerCharacters?.filter(char => 
    playerCharacterIds.includes(char._id)
  ) || [];

  const openEntitySelection = () => {
    setActiveModal("entitySelection");
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  const handleEntitySelect = async (entityId: Id<any>) => {
    if (!user?.id) {
      alert("You must be logged in to perform this action.");
      return;
    }
    
    try {
      const currentChars = playerCharacterIds || [];
      await updateCampaign({ 
        id: campaignId,
        clerkId: user.id,
        participantPlayerCharacterIds: [...currentChars, entityId] 
      });
      onUpdate();
    } catch (error) {
      console.error("Error linking player character:", error);
      alert("Failed to link player character. Please try again.");
    }
    
    closeModal();
  };

  const handleUnlinkEntity = async (entityId: Id<any>) => {
    if (!user?.id) {
      alert("You must be logged in to perform this action.");
      return;
    }
    
    try {
      const currentChars = playerCharacterIds || [];
      await updateCampaign({ 
        id: campaignId,
        clerkId: user.id,
        participantPlayerCharacterIds: currentChars.filter(id => id !== entityId) 
      });
      onUpdate();
    } catch (error) {
      console.error("Error unlinking player character:", error);
      alert("Failed to unlink player character. Please try again.");
    }
  };

  return (
    <div className="player-characters-section">
      <div className="section-header">
        <div className="header-left">
          <button 
            className="collapse-button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            aria-label={isCollapsed ? "Expand player characters section" : "Collapse player characters section"}
          >
            {isCollapsed ? "▶️" : "▼"}
          </button>
          <h3 className="section-title">👤 Player Characters ({campaignPlayerCharacters.length})</h3>
        </div>
        <div className="header-actions">
          <button 
            className="add-button"
            onClick={openEntitySelection}
          >
            + Add Character
          </button>
        </div>
      </div>
      
      {!isCollapsed && (
        <div className="section-content">
          {campaignPlayerCharacters.length > 0 ? (
            <div className="entities-grid">
              {campaignPlayerCharacters.map((character: any) => (
                <div key={character._id} className="entity-card">
                  <div className="entity-info">
                    <h4 className="entity-name">{character.name}</h4>
                    <p className="entity-description">
                      {character.race} {character.class} (Level {character.level})
                    </p>
                  </div>
                  <div className="entity-actions">
                    <button 
                      className="unlink-button"
                      onClick={() => handleUnlinkEntity(character._id)}
                    >
                      Unlink
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>No player characters added to this campaign yet.</p>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {activeModal === "entitySelection" && (
        <EntitySelectionModal
          isOpen={true}
          onClose={closeModal}
          onSelect={handleEntitySelect}
          entityType="playerCharacters"
          title="Link Player Character"
          currentLinkedIds={playerCharacterIds}
        />
      )}
    </div>
  );
};

export default PlayerCharactersSection; 