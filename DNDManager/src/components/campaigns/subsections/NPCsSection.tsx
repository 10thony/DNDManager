import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import EntitySelectionModal from "../../modals/EntitySelectionModal";
import NPCCreationModal from "../../modals/NPCCreationModal";
import "./NPCsSection.css";

interface NPCsSectionProps {
  campaignId: Id<"campaigns">;
  npcIds?: Id<"npcs">[];
  onUpdate: () => void;
}

type ModalType = "entitySelection" | "npcCreation" | null;

const NPCsSection: React.FC<NPCsSectionProps> = ({
  campaignId,
  npcIds = [],
  onUpdate,
}) => {
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const npcs = useQuery(api.npcs.getAllNpcs);
  const updateCampaign = useMutation(api.campaigns.updateCampaign);

  const campaignNpcs = npcs?.filter(npc => 
    npcIds.includes(npc._id)
  ) || [];

  const openEntitySelection = () => {
    setActiveModal("entitySelection");
  };

  const openNPCCreation = () => {
    setActiveModal("npcCreation");
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  const handleEntitySelect = async (entityId: Id<any>) => {
    try {
      const currentNpcs = npcIds || [];
      await updateCampaign({ 
        id: campaignId, 
        npcIds: [...currentNpcs, entityId] 
      });
      onUpdate();
    } catch (error) {
      console.error("Error linking NPC:", error);
      alert("Failed to link NPC. Please try again.");
    }
    
    closeModal();
  };

  const handleNPCCreated = async (npcId: Id<"npcs">) => {
    try {
      const currentNpcs = npcIds || [];
      await updateCampaign({ 
        id: campaignId, 
        npcIds: [...currentNpcs, npcId] 
      });
      onUpdate();
      alert("NPC created and linked successfully!");
    } catch (error) {
      console.error("Error linking NPC:", error);
      alert("NPC created but failed to link. You can link it manually.");
    }
    
    closeModal();
  };

  const handleUnlinkEntity = async (entityId: Id<any>) => {
    try {
      const currentNpcs = npcIds || [];
      await updateCampaign({ 
        id: campaignId, 
        npcIds: currentNpcs.filter(id => id !== entityId) 
      });
      onUpdate();
    } catch (error) {
      console.error("Error unlinking NPC:", error);
      alert("Failed to unlink NPC. Please try again.");
    }
  };

  return (
    <div className="npcs-section">
      <div className="section-header">
        <div className="header-left">
          <button 
            className="collapse-button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            aria-label={isCollapsed ? "Expand NPCs section" : "Collapse NPCs section"}
          >
            {isCollapsed ? "▶️" : "▼"}
          </button>
          <h3 className="section-title">🎭 NPCs ({campaignNpcs.length})</h3>
        </div>
        <div className="header-actions">
          <button 
            className="add-button"
            onClick={openEntitySelection}
          >
            + Link NPC
          </button>
          <button 
            className="add-button"
            onClick={openNPCCreation}
          >
            + Create NPC
          </button>
        </div>
      </div>
      
      {!isCollapsed && (
        <div className="section-content">
          {campaignNpcs.length > 0 ? (
            <div className="entities-grid">
              {campaignNpcs.map((npc: any) => (
                <div key={npc._id} className="entity-card">
                  <div className="entity-info">
                    <h4 className="entity-name">{npc.name}</h4>
                    <p className="entity-description">
                      {npc.race} {npc.class} (Level {npc.level})
                    </p>
                  </div>
                  <div className="entity-actions">
                    <button 
                      className="unlink-button"
                      onClick={() => handleUnlinkEntity(npc._id)}
                    >
                      Unlink
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>No NPCs added to this campaign yet.</p>
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
          entityType="npcs"
          title="Link Existing NPC"
          currentLinkedIds={npcIds}
        />
      )}

      {activeModal === "npcCreation" && (
        <NPCCreationModal
          isOpen={true}
          onClose={closeModal}
          onSuccess={handleNPCCreated}
        />
      )}
    </div>
  );
};

export default NPCsSection; 