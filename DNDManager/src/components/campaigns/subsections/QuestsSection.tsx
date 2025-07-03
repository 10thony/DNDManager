import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { useUser } from "@clerk/clerk-react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import EntitySelectionModal from "../../modals/EntitySelectionModal";
import "./QuestsSection.css";

interface QuestsSectionProps {
  campaignId: Id<"campaigns">;
  questIds?: Id<"quests">[];
  onUpdate: () => void;
}

type ModalType = "entitySelection" | null;

const QuestsSection: React.FC<QuestsSectionProps> = ({
  campaignId,
  questIds = [],
  onUpdate,
}) => {
  const { user } = useUser();
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const quests = useQuery(api.quests.getAllQuests);
  const updateCampaign = useMutation(api.campaigns.updateCampaign);

  const campaignQuests = quests?.filter(quest => 
    questIds.includes(quest._id)
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
      const currentQuests = questIds || [];
      await updateCampaign({ 
        id: campaignId,
        clerkId: user.id,
        questIds: [...currentQuests, entityId] 
      });
      onUpdate();
    } catch (error) {
      console.error("Error linking quest:", error);
      alert("Failed to link quest. Please try again.");
    }
    
    closeModal();
  };

  const handleUnlinkEntity = async (entityId: Id<any>) => {
    if (!user?.id) {
      alert("You must be logged in to perform this action.");
      return;
    }
    
    try {
      const currentQuests = questIds || [];
      await updateCampaign({ 
        id: campaignId,
        clerkId: user.id,
        questIds: currentQuests.filter(id => id !== entityId) 
      });
      onUpdate();
    } catch (error) {
      console.error("Error unlinking quest:", error);
      alert("Failed to unlink quest. Please try again.");
    }
  };

  return (
    <div className="quests-section">
      <div className="section-header">
        <div className="header-left">
          <button 
            className="collapse-button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            aria-label={isCollapsed ? "Expand quests section" : "Collapse quests section"}
          >
            {isCollapsed ? "▶️" : "▼"}
          </button>
          <h3 className="section-title">📜 Quests ({campaignQuests.length})</h3>
        </div>
        <div className="header-actions">
          <button 
            className="add-button"
            onClick={openEntitySelection}
          >
            + Add Quest
          </button>
        </div>
      </div>
      
      {!isCollapsed && (
        <div className="section-content">
          {campaignQuests.length > 0 ? (
            <div className="entities-grid">
              {campaignQuests.map((quest: any) => (
                <div key={quest._id} className="entity-card">
                  <div className="entity-info">
                    <h4 className="entity-name">{quest.name}</h4>
                    <p className="entity-description">
                      {quest.description?.substring(0, 100)}...
                    </p>
                    <span className="entity-status">{quest.status}</span>
                  </div>
                  <div className="entity-actions">
                    <button 
                      className="unlink-button"
                      onClick={() => handleUnlinkEntity(quest._id)}
                    >
                      Unlink
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>No quests added to this campaign yet.</p>
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
          entityType="quests"
          title="Link Existing Quest"
          currentLinkedIds={questIds}
        />
      )}
    </div>
  );
};

export default QuestsSection; 