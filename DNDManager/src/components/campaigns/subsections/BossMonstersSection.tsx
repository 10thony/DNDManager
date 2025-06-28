import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import EntitySelectionModal from "../../modals/EntitySelectionModal";
import MonsterCreationModal from "../../modals/MonsterCreationModal";
import "./BossMonstersSection.css";

interface BossMonstersSectionProps {
  campaignId: Id<"campaigns">;
  monsterIds?: Id<"monsters">[];
  onUpdate: () => void;
}

type ModalType = "entitySelection" | "monsterCreation" | null;

const BossMonstersSection: React.FC<BossMonstersSectionProps> = ({
  campaignId,
  monsterIds = [],
  onUpdate,
}) => {
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const monsters = useQuery(api.monsters.getAllMonsters);
  const updateCampaign = useMutation(api.campaigns.updateCampaign);

  // Filter for boss monsters (CR 10 or higher)
  const campaignBossMonsters = monsters?.filter(monster => 
    monsterIds.includes(monster._id) && 
    parseFloat(monster.challengeRating) >= 10
  ) || [];

  const openEntitySelection = () => {
    setActiveModal("entitySelection");
  };

  const openMonsterCreation = () => {
    setActiveModal("monsterCreation");
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  const handleEntitySelect = async (entityId: Id<any>) => {
    try {
      const currentMonsters = monsterIds || [];
      await updateCampaign({ 
        id: campaignId, 
        monsterIds: [...currentMonsters, entityId] 
      });
      onUpdate();
    } catch (error) {
      console.error("Error linking monster:", error);
      alert("Failed to link monster. Please try again.");
    }
    
    closeModal();
  };

  const handleMonsterCreated = async (monsterId: Id<"monsters">) => {
    try {
      const currentMonsters = monsterIds || [];
      await updateCampaign({ 
        id: campaignId, 
        monsterIds: [...currentMonsters, monsterId] 
      });
      onUpdate();
      alert("Monster created and linked successfully!");
    } catch (error) {
      console.error("Error linking monster:", error);
      alert("Monster created but failed to link. You can link it manually.");
    }
    
    closeModal();
  };

  const handleUnlinkEntity = async (entityId: Id<any>) => {
    try {
      const currentMonsters = monsterIds || [];
      await updateCampaign({ 
        id: campaignId, 
        monsterIds: currentMonsters.filter(id => id !== entityId) 
      });
      onUpdate();
    } catch (error) {
      console.error("Error unlinking monster:", error);
      alert("Failed to unlink monster. Please try again.");
    }
  };

  return (
    <div className="boss-monsters-section">
      <div className="section-header">
        <div className="header-left">
          <button 
            className="collapse-button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            aria-label={isCollapsed ? "Expand boss monsters section" : "Collapse boss monsters section"}
          >
            {isCollapsed ? "▶️" : "▼"}
          </button>
          <h3 className="section-title">🐉 Boss Monsters ({campaignBossMonsters.length})</h3>
        </div>
        <div className="header-actions">
          <button 
            className="add-button"
            onClick={openEntitySelection}
          >
            + Link Monster
          </button>
          <button 
            className="add-button"
            onClick={openMonsterCreation}
          >
            + Create Monster
          </button>
        </div>
      </div>
      
      {!isCollapsed && (
        <div className="section-content">
          {campaignBossMonsters.length > 0 ? (
            <div className="entities-grid">
              {campaignBossMonsters.map((monster: any) => (
                <div key={monster._id} className="entity-card">
                  <div className="entity-info">
                    <h4 className="entity-name">{monster.name}</h4>
                    <p className="entity-description">
                      {monster.size} {monster.type} (CR {monster.challengeRating})
                    </p>
                    <span className="entity-cr">Challenge Rating: {monster.challengeRating}</span>
                  </div>
                  <div className="entity-actions">
                    <button 
                      className="unlink-button"
                      onClick={() => handleUnlinkEntity(monster._id)}
                    >
                      Unlink
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>No boss monsters (CR 10+) added to this campaign yet.</p>
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
          entityType="monsters"
          title="Link Existing Monster (CR 10+)"
          currentLinkedIds={monsterIds}
        />
      )}

      {activeModal === "monsterCreation" && (
        <MonsterCreationModal
          isOpen={true}
          onClose={closeModal}
          onSuccess={handleMonsterCreated}
        />
      )}
    </div>
  );
};

export default BossMonstersSection; 