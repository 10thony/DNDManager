import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { useNavigate, useSearchParams } from "react-router-dom";
// import { useDarkMode } from "../contexts/DarkModeContext";
import InteractionCreationForm from "./InteractionCreationForm";
import EntitySelectionModal from "./modals/EntitySelectionModal";
import LocationCreationModal from "./modals/LocationCreationModal";
import NPCCreationModal from "./modals/NPCCreationModal";
import MonsterCreationModal from "./modals/MonsterCreationModal";
import "./InteractionDetail.css";

interface InteractionDetailProps {
  interactionId: Id<"interactions">;
}

type ModalType = 
  | "entitySelection"
  | "locationCreation"
  | "npcCreation"
  | "monsterCreation"
  | "questCreation"
  | "questTaskCreation"
  | "characterCreation"
  | null;

type EntityType = "quests" | "questTasks" | "locations" | "npcs" | "monsters" | "playerCharacters" | "timelineEvents";

const InteractionDetail: React.FC<InteractionDetailProps> = ({ interactionId }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [entitySelectionType, setEntitySelectionType] = useState<EntityType>("quests");
  const [entitySelectionTitle, setEntitySelectionTitle] = useState("");
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());
  
  const interaction = useQuery(api.interactions.getInteractionById, { id: interactionId });
  const deleteInteraction = useMutation(api.interactions.deleteInteraction);
  const updateInteraction = useMutation(api.interactions.updateInteraction);
  
  // Check if user came from a campaign
  const fromCampaignId = searchParams.get('fromCampaign');

  const handleBackNavigation = () => {
    if (fromCampaignId) {
      // Navigate back to the campaign details
      navigate(`/campaigns/${fromCampaignId}`);
    } else {
      // Navigate back to interactions list (original behavior)
      navigate("/interactions");
    }
  };
  
  const quest = useQuery(
    api.quests.getQuestById,
    interaction?.questId ? { id: interaction.questId } : "skip"
  );
  
  const questTask = useQuery(
    api.questTasks.getQuestTaskById,
    interaction?.questTaskId ? { id: interaction.questTaskId } : "skip"
  );
  
  const playerCharacters = useQuery(api.characters.getAllCharacters);
  const npcs = useQuery(api.npcs.getAllNpcs);
  const monsters = useQuery(api.monsters.getAllMonsters);
  // const locations = useQuery(api.locations.list);
  // const quests = useQuery(api.quests.getAllQuests);
  // const questTasks = useQuery(api.questTasks.getAllQuestTasks);
  const timelineEvents = useQuery(api.timelineEvents.getAllTimelineEvents);

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this interaction? This action cannot be undone.")) {
      setIsDeleting(true);
      try {
        await deleteInteraction({ id: interactionId });
        handleBackNavigation();
      } catch (error) {
        console.error("Error deleting interaction:", error);
        alert("Failed to delete interaction. Please try again.");
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleSubmitSuccess = () => {
    setIsEditing(false);
  };

  const openEntitySelection = (entityType: EntityType, title: string) => {
    setEntitySelectionType(entityType);
    setEntitySelectionTitle(title);
    setActiveModal("entitySelection");
  };

  const openLocationCreation = () => {
    setActiveModal("locationCreation");
  };

  const openNPCCreation = () => {
    setActiveModal("npcCreation");
  };

  const openMonsterCreation = () => {
    setActiveModal("monsterCreation");
  };

  const closeModal = () => {
    setActiveModal(null);
    setEntitySelectionType("quests");
    setEntitySelectionTitle("");
  };

  const toggleSection = (sectionName: string) => {
    setCollapsedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionName)) {
        newSet.delete(sectionName);
      } else {
        newSet.add(sectionName);
      }
      return newSet;
    });
  };

  const handleEntitySelect = async (entityId: Id<any>) => {
    if (!interaction) return;

    try {
      const updates: any = {};
      
      switch (entitySelectionType) {
        case "quests":
          updates.questId = entityId;
          break;
        case "questTasks":
          updates.questTaskId = entityId;
          break;
        case "locations":
          // For now, we'll just show a success message
          alert("Location linked successfully!");
          break;
        case "npcs":
          const currentNpcs = interaction.npcIds || [];
          updates.npcIds = [...currentNpcs, entityId];
          break;
        case "monsters":
          const currentMonsters = interaction.monsterIds || [];
          updates.monsterIds = [...currentMonsters, entityId];
          break;
        case "playerCharacters":
          const currentChars = interaction.playerCharacterIds || [];
          updates.playerCharacterIds = [...currentChars, entityId];
          break;
        case "timelineEvents":
          const currentTimelineEvents = interaction.timelineEventIds || [];
          updates.timelineEventIds = [...currentTimelineEvents, entityId];
          break;
      }

      if (Object.keys(updates).length > 0) {
        await updateInteraction({ id: interactionId, ...updates });
      }
    } catch (error) {
      console.error("Error linking entity:", error);
      alert("Failed to link entity. Please try again.");
    }
    
    closeModal();
  };

  const handleLocationCreated = async () => {
    alert("Location created successfully! You can now link it to this interaction.");
    closeModal();
  };

  const handleNPCCreated = async (npcId: Id<"npcs">) => {
    if (!interaction) return;

    try {
      const currentNpcs = interaction.npcIds || [];
      await updateInteraction({ 
        id: interactionId, 
        npcIds: [...currentNpcs, npcId] 
      });
      alert("NPC created and linked successfully!");
    } catch (error) {
      console.error("Error linking NPC:", error);
      alert("NPC created but failed to link. You can link it manually.");
    }
    
    closeModal();
  };

  const handleMonsterCreated = async (monsterId: Id<"monsters">) => {
    if (!interaction) return;

    try {
      const currentMonsters = interaction.monsterIds || [];
      await updateInteraction({ 
        id: interactionId, 
        monsterIds: [...currentMonsters, monsterId] 
      });
      alert("Monster created and linked successfully!");
    } catch (error) {
      console.error("Error linking monster:", error);
      alert("Monster created but failed to link. You can link it manually.");
    }
    
    closeModal();
  };

  const handleUnlinkEntity = async (entityType: string, entityId: Id<any>) => {
    if (!interaction) return;

    try {
      const updates: any = {};
      
      switch (entityType) {
        case "quest":
          updates.questId = undefined;
          break;
        case "questTask":
          updates.questTaskId = undefined;
          break;
        case "npc":
          const currentNpcs = interaction.npcIds || [];
          updates.npcIds = currentNpcs.filter(id => id !== entityId);
          break;
        case "monster":
          const currentMonsters = interaction.monsterIds || [];
          updates.monsterIds = currentMonsters.filter(id => id !== entityId);
          break;
        case "playerCharacter":
          const currentChars = interaction.playerCharacterIds || [];
          updates.playerCharacterIds = currentChars.filter(id => id !== entityId);
          break;
        case "timelineEvent":
          const currentTimelineEvents = interaction.timelineEventIds || [];
          updates.timelineEventIds = currentTimelineEvents.filter(id => id !== entityId);
          break;
      }

      await updateInteraction({ id: interactionId, ...updates });
    } catch (error) {
      console.error("Error unlinking entity:", error);
      alert("Failed to unlink entity. Please try again.");
    }
  };

  if (!interaction) {
    return (
      <div className="interaction-detail-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading interaction details...</p>
        </div>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="interaction-detail-container">
        <InteractionCreationForm
          onSubmitSuccess={handleSubmitSuccess}
          onCancel={handleCancel}
          editingInteractionId={interactionId}
        />
      </div>
    );
  }

  const participantCharacters = playerCharacters?.filter((char: any) => 
    interaction.playerCharacterIds?.includes(char._id)
  ) || [];

  const participantNpcs = npcs?.filter((npc: any) => 
    interaction.npcIds?.includes(npc._id)
  ) || [];

  const participantMonsters = monsters?.filter((monster: any) => 
    interaction.monsterIds?.includes(monster._id)
  ) || [];

  return (
    <div className="interaction-detail-container">
      {/* Header Section */}
      <div className="detail-header">
        <div className="header-content">
          <h1 className="interaction-title">{interaction.name}</h1>
          <div className="interaction-meta">
            <div className="meta-item">
              <span className="meta-icon">📅</span>
              <span>Created {new Date(interaction.createdAt).toLocaleDateString()}</span>
            </div>
            {quest && (
              <div className="meta-item">
                <span className="meta-icon">📜</span>
                <span>Linked to Quest</span>
              </div>
            )}
            {questTask && (
              <div className="meta-item">
                <span className="meta-icon">✅</span>
                <span>Linked to Task</span>
              </div>
            )}
          </div>
        </div>
        <div className="header-actions">
          <button className="back-button" onClick={handleBackNavigation}>
            ← {fromCampaignId ? "Back to Campaign" : "Back to Interactions"}
          </button>
        </div>
      </div>

      {/* Quick Actions Bar */}
      <div className="quick-actions-bar">
        <div className="action-group">
          <button 
            className="action-button primary"
            onClick={() => openEntitySelection("quests", "Link Existing Quest")}
          >
            📜 Link Quest
          </button>
          <button 
            className="action-button primary"
            onClick={() => openEntitySelection("questTasks", "Link Existing Task")}
          >
            ✅ Link Task
          </button>
        </div>
        <div className="action-group">
          <button 
            className="action-button secondary"
            onClick={() => openEntitySelection("locations", "Link Existing Location")}
          >
            🗺️ Link Location
          </button>
          <button 
            className="action-button secondary"
            onClick={openLocationCreation}
          >
            🗺️ Create Location
          </button>
        </div>
        <div className="action-group">
          <button 
            className="action-button secondary"
            onClick={() => openEntitySelection("npcs", "Link Existing NPC")}
          >
            🎭 Link NPC
          </button>
          <button 
            className="action-button secondary"
            onClick={openNPCCreation}
          >
            🎭 Create NPC
          </button>
        </div>
        <div className="action-group">
          <button 
            className="action-button secondary"
            onClick={() => openEntitySelection("monsters", "Link Existing Monster")}
          >
            🐉 Link Monster
          </button>
          <button 
            className="action-button secondary"
            onClick={openMonsterCreation}
          >
            🐉 Create Monster
          </button>
        </div>
        <div className="action-group">
          <button 
            className="action-button secondary"
            onClick={() => openEntitySelection("playerCharacters", "Link Player Character")}
          >
            👤 Link Character
          </button>
        </div>
        <div className="action-group">
          <button 
            className="action-button secondary"
            onClick={() => openEntitySelection("timelineEvents", "Link Timeline Event")}
          >
            📅 Link Timeline Event
          </button>
        </div>
      </div>

      {/* Description Section */}
      {interaction.description && (
        <div className="interaction-description">
          <h3 className="section-title">Description</h3>
          <p className="description-content">{interaction.description}</p>
        </div>
      )}

      {/* Dynamic Content Sections */}
      <div className="interaction-sections">
        {/* Quests Section */}
        <div className="section">
          <div 
            className="section-header"
            onClick={() => toggleSection("quests")}
            style={{ cursor: "pointer" }}
          >
            <h3 className="section-title">📜 Quests ({quest ? 1 : 0})</h3>
            <div className="header-actions">
              <button 
                className="add-button"
                onClick={(e) => {
                  e.stopPropagation();
                  openEntitySelection("quests", "Link Existing Quest");
                }}
              >
                + Add Quest
              </button>
              <span className="collapse-indicator">
                {collapsedSections.has("quests") ? "▼" : "▲"}
              </span>
            </div>
          </div>
          {!collapsedSections.has("quests") && (
            <div className="section-content">
              {quest ? (
                <div className="entity-card">
                  <div className="entity-info">
                    <h4 className="entity-name">{quest.name}</h4>
                    <p className="entity-description">{quest.description || "No description"}</p>
                    <span className="entity-status">{quest.status}</span>
                  </div>
                  <div className="entity-actions">
                    <button 
                      className="unlink-button"
                      onClick={() => handleUnlinkEntity("quest", quest._id)}
                    >
                      Unlink
                    </button>
                  </div>
                </div>
              ) : (
                <div className="empty-state">
                  <p>No quests linked to this interaction.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Quest Tasks Section */}
        <div className="section">
          <div 
            className="section-header"
            onClick={() => toggleSection("questTasks")}
            style={{ cursor: "pointer" }}
          >
            <h3 className="section-title">✅ Quest Tasks ({questTask ? 1 : 0})</h3>
            <div className="header-actions">
              <button 
                className="add-button"
                onClick={(e) => {
                  e.stopPropagation();
                  openEntitySelection("questTasks", "Link Existing Task");
                }}
              >
                + Add Task
              </button>
              <span className="collapse-indicator">
                {collapsedSections.has("questTasks") ? "▼" : "▲"}
              </span>
            </div>
          </div>
          {!collapsedSections.has("questTasks") && (
            <div className="section-content">
              {questTask ? (
                <div className="entity-card">
                  <div className="entity-info">
                    <h4 className="entity-name">{questTask.title}</h4>
                    <p className="entity-description">{questTask.description || "No description"}</p>
                    <span className="entity-status">{questTask.status}</span>
                  </div>
                  <div className="entity-actions">
                    <button 
                      className="unlink-button"
                      onClick={() => handleUnlinkEntity("questTask", questTask._id)}
                    >
                      Unlink
                    </button>
                  </div>
                </div>
              ) : (
                <div className="empty-state">
                  <p>No quest tasks linked to this interaction.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Player Characters Section */}
        <div className="section">
          <div 
            className="section-header"
            onClick={() => toggleSection("playerCharacters")}
            style={{ cursor: "pointer" }}
          >
            <h3 className="section-title">👤 Player Characters ({participantCharacters.length})</h3>
            <div className="header-actions">
              <button 
                className="add-button"
                onClick={(e) => {
                  e.stopPropagation();
                  openEntitySelection("playerCharacters", "Link Player Character");
                }}
              >
                + Add Character
              </button>
              <span className="collapse-indicator">
                {collapsedSections.has("playerCharacters") ? "▼" : "▲"}
              </span>
            </div>
          </div>
          {!collapsedSections.has("playerCharacters") && (
            <div className="section-content">
              {participantCharacters.length > 0 ? (
                <div className="entities-grid">
                  {participantCharacters.map((character: any) => (
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
                          onClick={() => handleUnlinkEntity("playerCharacter", character._id)}
                        >
                          Unlink
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <p>No player characters involved in this interaction.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* NPCs Section */}
        <div className="section">
          <div 
            className="section-header"
            onClick={() => toggleSection("npcs")}
            style={{ cursor: "pointer" }}
          >
            <h3 className="section-title">🎭 NPCs ({participantNpcs.length})</h3>
            <div className="header-actions">
              <button 
                className="add-button"
                onClick={(e) => {
                  e.stopPropagation();
                  openEntitySelection("npcs", "Link Existing NPC");
                }}
              >
                + Link NPC
              </button>
              <button 
                className="add-button"
                onClick={(e) => {
                  e.stopPropagation();
                  openNPCCreation();
                }}
              >
                + Create NPC
              </button>
              <span className="collapse-indicator">
                {collapsedSections.has("npcs") ? "▼" : "▲"}
              </span>
            </div>
          </div>
          {!collapsedSections.has("npcs") && (
            <div className="section-content">
              {participantNpcs.length > 0 ? (
                <div className="entities-grid">
                  {participantNpcs.map((npc: any) => (
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
                          onClick={() => handleUnlinkEntity("npc", npc._id)}
                        >
                          Unlink
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <p>No NPCs involved in this interaction.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Monsters Section */}
        <div className="section">
          <div 
            className="section-header"
            onClick={() => toggleSection("monsters")}
            style={{ cursor: "pointer" }}
          >
            <h3 className="section-title">🐉 Monsters ({participantMonsters.length})</h3>
            <div className="header-actions">
              <button 
                className="add-button"
                onClick={(e) => {
                  e.stopPropagation();
                  openEntitySelection("monsters", "Link Existing Monster");
                }}
              >
                + Link Monster
              </button>
              <button 
                className="add-button"
                onClick={(e) => {
                  e.stopPropagation();
                  openMonsterCreation();
                }}
              >
                + Create Monster
              </button>
              <span className="collapse-indicator">
                {collapsedSections.has("monsters") ? "▼" : "▲"}
              </span>
            </div>
          </div>
          {!collapsedSections.has("monsters") && (
            <div className="section-content">
              {participantMonsters.length > 0 ? (
                <div className="entities-grid">
                  {participantMonsters.map((monster: any) => (
                    <div key={monster._id} className="entity-card">
                      <div className="entity-info">
                        <h4 className="entity-name">{monster.name}</h4>
                        <p className="entity-description">
                          {monster.size} {monster.type} (CR {monster.challengeRating})
                        </p>
                      </div>
                      <div className="entity-actions">
                        <button 
                          className="unlink-button"
                          onClick={() => handleUnlinkEntity("monster", monster._id)}
                        >
                          Unlink
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <p>No monsters involved in this interaction.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Timeline Events Section */}
        <div className="section">
          <div 
            className="section-header"
            onClick={() => toggleSection("timelineEvents")}
            style={{ cursor: "pointer" }}
          >
            <h3 className="section-title">📅 Timeline Events ({interaction.timelineEventIds?.length || 0})</h3>
            <div className="header-actions">
              <button 
                className="add-button"
                onClick={(e) => {
                  e.stopPropagation();
                  openEntitySelection("timelineEvents", "Link Existing Timeline Event");
                }}
              >
                + Link Timeline Event
              </button>
              <span className="collapse-indicator">
                {collapsedSections.has("timelineEvents") ? "▼" : "▲"}
              </span>
            </div>
          </div>
          {!collapsedSections.has("timelineEvents") && (
            <div className="section-content">
              {interaction.timelineEventIds && interaction.timelineEventIds.length > 0 ? (
                <div className="entities-grid">
                  {timelineEvents?.filter((event: any) => 
                    interaction.timelineEventIds?.includes(event._id)
                  ).map((event: any) => (
                    <div key={event._id} className="entity-card">
                      <div className="entity-info">
                        <h4 className="entity-name">{event.title}</h4>
                        <p className="entity-description">
                          {event.type || "Custom"} - {new Date(event.date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="entity-actions">
                        <button 
                          className="unlink-button"
                          onClick={() => handleUnlinkEntity("timelineEvent", event._id)}
                        >
                          Unlink
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <p>No timeline events linked to this interaction.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="action-buttons">
        <button
          className="edit-button"
          onClick={handleEdit}
          disabled={isDeleting}
        >
          ✏️ Edit Interaction
        </button>
        <button
          className="delete-button"
          onClick={handleDelete}
          disabled={isDeleting}
        >
          {isDeleting ? "🗑️ Deleting..." : "🗑️ Delete Interaction"}
        </button>
      </div>

      {/* Modals */}
      {activeModal === "entitySelection" && (
        <EntitySelectionModal
          isOpen={true}
          onClose={closeModal}
          onSelect={handleEntitySelect}
          entityType={entitySelectionType}
          title={entitySelectionTitle}
          currentLinkedIds={
            entitySelectionType === "quests" && quest ? [quest._id] :
            entitySelectionType === "questTasks" && questTask ? [questTask._id] :
            entitySelectionType === "npcs" ? interaction.npcIds || [] :
            entitySelectionType === "monsters" ? interaction.monsterIds || [] :
            entitySelectionType === "playerCharacters" ? interaction.playerCharacterIds || [] :
            entitySelectionType === "timelineEvents" ? interaction.timelineEventIds || [] :
            []
          }
        />
      )}

      {activeModal === "locationCreation" && (
        <LocationCreationModal
          isOpen={true}
          onClose={closeModal}
          onSuccess={handleLocationCreated}
        />
      )}

      {activeModal === "npcCreation" && (
        <NPCCreationModal
          isOpen={true}
          onClose={closeModal}
          onSuccess={handleNPCCreated}
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

export default InteractionDetail; 