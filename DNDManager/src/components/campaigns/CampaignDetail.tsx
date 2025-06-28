import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../../../convex/_generated/api";
import { useDarkMode } from "../../contexts/DarkModeContext";
import { CampaignValidationState, CampaignCreationRequirements } from "../../schemas/campaign";
import InfoSection from "./subsections/InfoSection";
import TimelineSection from "./subsections/TimelineSection";
import PlayerCharactersSection from "./subsections/PlayerCharactersSection";
import NPCsSection from "./subsections/NPCsSection";
import QuestsSection from "./subsections/QuestsSection";
import LocationsSection from "./subsections/LocationsSection";
import BossMonstersSection from "./subsections/BossMonstersSection";
import InteractionsSection from "./subsections/InteractionsSection";
import "./CampaignDetail.css";

const CampaignDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { isDarkMode } = useDarkMode();
  const [validationState, setValidationState] = useState<CampaignValidationState>({
    hasName: false,
    hasTimelineEvents: false,
    hasPlayerCharacters: false,
    hasNPCs: false,
    hasQuests: false,
    hasLocations: false,
    hasBossMonsters: false,
    hasInteractions: false,
  });

  const requirements: CampaignCreationRequirements = {
    timelineEventsRequired: 3,
    playerCharactersRequired: 1,
    npcsRequired: 1,
    questsRequired: 1,
    locationsRequired: 1,
    bossMonstersRequired: 1,
    interactionsRequired: 1,
  };

  const campaign = useQuery(
    api.campaigns.getCampaignById,
    id ? { id: id as any } : "skip"
  );

  const playerCharacters = useQuery(api.characters.getAllCharacters);
  const npcs = useQuery(api.npcs.getAllNpcs);
  const quests = useQuery(api.quests.getAllQuests);
  const locations = useQuery(api.locations.list);
  const monsters = useQuery(api.monsters.getAllMonsters);
  const interactions = useQuery(
    api.interactions.getInteractionsByCampaign,
    id ? { campaignId: id as any } : "skip"
  );

  const updateCampaign = useMutation(api.campaigns.updateCampaign);

  // Calculate boss monsters (CR 10 or higher)
  const getBossMonsterCount = () => {
    if (!campaign || !monsters) return 0;
    const campaignMonsters = monsters.filter(monster => 
      campaign.monsterIds?.includes(monster._id)
    );
    return campaignMonsters.filter(monster => {
      const cr = parseFloat(monster.challengeRating);
      return !isNaN(cr) && cr >= 10;
    }).length;
  };

  // Update validation state when campaign data changes
  useEffect(() => {
    if (!campaign) return;

    const bossMonsterCount = getBossMonsterCount();
    
    setValidationState({
      hasName: !!campaign.name?.trim(),
      hasTimelineEvents: (campaign.timelineEventIds?.length || 0) >= requirements.timelineEventsRequired,
      hasPlayerCharacters: (campaign.participantPlayerCharacterIds?.length || 0) >= requirements.playerCharactersRequired,
      hasNPCs: (campaign.npcIds?.length || 0) >= requirements.npcsRequired,
      hasQuests: (campaign.questIds?.length || 0) >= requirements.questsRequired,
      hasLocations: (campaign.locationIds?.length || 0) >= requirements.locationsRequired,
      hasBossMonsters: bossMonsterCount >= requirements.bossMonstersRequired,
      hasInteractions: (interactions?.length || 0) >= requirements.interactionsRequired,
    });
  }, [campaign, monsters, interactions, requirements]);

  const isCampaignComplete = Object.values(validationState).every(Boolean);

  const handleUpdate = () => {
    // Trigger a re-render to update validation state
    // This will be called by child components when they update the campaign
  };

  const handleSaveCampaign = async () => {
    if (!campaign || !isCampaignComplete) return;

    try {
      // Mark campaign as complete or update status
      await updateCampaign({
        id: campaign._id,
        // Add any completion fields here
      });
      
      alert("Campaign saved successfully!");
    } catch (error) {
      console.error("Error saving campaign:", error);
      alert("Failed to save campaign. Please try again.");
    }
  };

  if (!campaign) {
    return (
      <div className="campaign-detail-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading campaign details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="campaign-detail-container">
      {/* Header Section */}
      <div className="detail-header">
        <div className="header-content">
          <h1 className="campaign-title">{campaign.name || "Untitled Campaign"}</h1>
          <div className="campaign-meta">
            <div className="meta-item">
              <span className="meta-icon">📅</span>
              <span>Created {new Date(campaign.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="meta-item">
              <span className="meta-icon">👥</span>
              <span>{campaign.participantPlayerCharacterIds?.length || 0} Player Characters</span>
            </div>
            <div className="meta-item">
              <span className="meta-icon">📜</span>
              <span>{campaign.questIds?.length || 0} Quests</span>
            </div>
          </div>
        </div>
        <div className="header-actions">
          <button className="back-button" onClick={() => navigate("/campaigns")}>
            ← Back to Campaigns
          </button>
        </div>
      </div>

      {/* Validation Status */}
      <div className={`validation-status ${isCampaignComplete ? 'complete' : 'incomplete'}`}>
        <div className="validation-header">
          <h3 className="validation-title">
            {isCampaignComplete ? '✅ Campaign Complete' : '⚠️ Campaign Incomplete'}
          </h3>
          <div className="validation-progress">
            {Object.values(validationState).filter(Boolean).length} / {Object.keys(validationState).length} requirements met
          </div>
        </div>
        
        <div className="validation-items">
          <div className={`validation-item ${validationState.hasName ? 'complete' : 'incomplete'}`}>
            <span className="validation-icon">{validationState.hasName ? '✅' : '❌'}</span>
            <span className="validation-text">Campaign name is set</span>
          </div>
          <div className={`validation-item ${validationState.hasTimelineEvents ? 'complete' : 'incomplete'}`}>
            <span className="validation-icon">{validationState.hasTimelineEvents ? '✅' : '❌'}</span>
            <span className="validation-text">Timeline events ({campaign.timelineEventIds?.length || 0}/{requirements.timelineEventsRequired})</span>
          </div>
          <div className={`validation-item ${validationState.hasPlayerCharacters ? 'complete' : 'incomplete'}`}>
            <span className="validation-icon">{validationState.hasPlayerCharacters ? '✅' : '❌'}</span>
            <span className="validation-text">Player characters ({campaign.participantPlayerCharacterIds?.length || 0}/{requirements.playerCharactersRequired})</span>
          </div>
          <div className={`validation-item ${validationState.hasNPCs ? 'complete' : 'incomplete'}`}>
            <span className="validation-icon">{validationState.hasNPCs ? '✅' : '❌'}</span>
            <span className="validation-text">NPCs ({campaign.npcIds?.length || 0}/{requirements.npcsRequired})</span>
          </div>
          <div className={`validation-item ${validationState.hasQuests ? 'complete' : 'incomplete'}`}>
            <span className="validation-icon">{validationState.hasQuests ? '✅' : '❌'}</span>
            <span className="validation-text">Quests ({campaign.questIds?.length || 0}/{requirements.questsRequired})</span>
          </div>
          <div className={`validation-item ${validationState.hasLocations ? 'complete' : 'incomplete'}`}>
            <span className="validation-icon">{validationState.hasLocations ? '✅' : '❌'}</span>
            <span className="validation-text">Locations ({campaign.locationIds?.length || 0}/{requirements.locationsRequired})</span>
          </div>
          <div className={`validation-item ${validationState.hasBossMonsters ? 'complete' : 'incomplete'}`}>
            <span className="validation-icon">{validationState.hasBossMonsters ? '✅' : '❌'}</span>
            <span className="validation-text">Boss monsters ({getBossMonsterCount()}/{requirements.bossMonstersRequired})</span>
          </div>
          <div className={`validation-item ${validationState.hasInteractions ? 'complete' : 'incomplete'}`}>
            <span className="validation-icon">{validationState.hasInteractions ? '✅' : '❌'}</span>
            <span className="validation-text">Interactions ({interactions?.length || 0}/{requirements.interactionsRequired})</span>
          </div>
        </div>
      </div>

      {/* Campaign Sections */}
      <div className="campaign-sections">
        <InfoSection
          campaignId={campaign._id}
          name={campaign.name}
          description={campaign.description}
          worldSetting={campaign.worldSetting}
          isPublic={campaign.isPublic}
          onUpdate={handleUpdate}
        />

        <TimelineSection
          campaignId={campaign._id}
          timelineEventIds={campaign.timelineEventIds}
          onUpdate={handleUpdate}
        />

        <PlayerCharactersSection
          campaignId={campaign._id}
          playerCharacterIds={campaign.participantPlayerCharacterIds}
          onUpdate={handleUpdate}
        />

        <NPCsSection
          campaignId={campaign._id}
          npcIds={campaign.npcIds}
          onUpdate={handleUpdate}
        />

        <QuestsSection
          campaignId={campaign._id}
          questIds={campaign.questIds}
          onUpdate={handleUpdate}
        />

        <LocationsSection
          campaignId={campaign._id}
          locationIds={campaign.locationIds}
          onUpdate={handleUpdate}
        />

        <BossMonstersSection
          campaignId={campaign._id}
          monsterIds={campaign.monsterIds}
          onUpdate={handleUpdate}
        />

        <InteractionsSection
          campaignId={campaign._id}
          onUpdate={handleUpdate}
        />
      </div>

      {/* Save Button */}
      <div className="save-section">
        <button
          className={`save-button ${isCampaignComplete ? 'enabled' : 'disabled'}`}
          onClick={handleSaveCampaign}
          disabled={!isCampaignComplete}
        >
          {isCampaignComplete ? '💾 Save Campaign' : '⚠️ Complete Requirements to Save'}
        </button>
      </div>
    </div>
  );
};

export default CampaignDetail; 