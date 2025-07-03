import React, { useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { api } from '../../../convex/_generated/api';
import { Id } from '../../../convex/_generated/dataModel';
import './LiveInteractionCreationForm.css';

interface LiveInteractionCreationFormProps {
  campaignId: Id<"campaigns">;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const LiveInteractionCreationForm: React.FC<LiveInteractionCreationFormProps> = ({
  campaignId,
  onSuccess,
  onCancel
}) => {
  const navigate = useNavigate();
  const { user } = useUser();
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    relatedLocationId: '' as Id<"locations"> | '',
    relatedQuestId: '' as Id<"quests"> | '',
  });

  // Participant selection
  const [selectedPlayerCharacters, setSelectedPlayerCharacters] = useState<Id<"playerCharacters">[]>([]);
  const [selectedNPCs, setSelectedNPCs] = useState<Id<"npcs">[]>([]);
  const [selectedMonsters, setSelectedMonsters] = useState<Id<"monsters">[]>([]);

  // Reward configuration
  const [rewardItems, setRewardItems] = useState<Id<"items">[]>([]);
  const [xpAwards, setXpAwards] = useState<Array<{
    playerCharacterId: Id<"playerCharacters">;
    xp: number;
  }>>([]);

  // Queries
  const campaign = useQuery(api.campaigns.getCampaignById, { 
    id: campaignId, 
    clerkId: user?.id || '' 
  });
  const playerCharacters = useQuery(api.characters.getAllCharacters);
  const npcs = useQuery(api.npcs.getAllNpcs);
  const monsters = useQuery(api.monsters.getAllMonsters);
  const locations = useQuery(api.locations.list);
  const quests = useQuery(api.quests.getAllQuests);
  const items = useQuery(api.items.getItems);

  // Mutations
  const createInteraction = useMutation(api.interactions.createInteraction);

  // Filter participants to campaign-specific ones
  const campaignPlayerCharacters = playerCharacters?.filter(char => 
    campaign?.participantPlayerCharacterIds?.includes(char._id)
  ) || [];
  
  const campaignNPCs = npcs?.filter(npc => 
    campaign?.npcIds?.includes(npc._id)
  ) || [];
  
  const campaignMonsters = monsters?.filter(monster => 
    campaign?.monsterIds?.includes(monster._id)
  ) || [];

  const campaignLocations = locations?.filter(location => 
    campaign?.locationIds?.includes(location._id)
  ) || [];

  const campaignQuests = quests?.filter(quest => 
    campaign?.questIds?.includes(quest._id)
  ) || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) {
      alert('You must be logged in to create an interaction.');
      return;
    }

    if (!formData.name.trim()) {
      alert('Please enter an interaction name.');
      return;
    }

    if (selectedPlayerCharacters.length === 0 && selectedNPCs.length === 0 && selectedMonsters.length === 0) {
      alert('Please select at least one participant.');
      return;
    }

    try {
      const interactionId = await createInteraction({
        name: formData.name,
        description: formData.description || undefined,
        clerkId: user.id,
        campaignId: campaignId,
        relatedLocationId: formData.relatedLocationId || undefined,
        relatedQuestId: formData.relatedQuestId || undefined,
        participantPlayerCharacterIds: selectedPlayerCharacters,
        participantNpcIds: selectedNPCs,
        participantMonsterIds: selectedMonsters,
        rewardItemIds: rewardItems,
        xpAwards: xpAwards,
      });

      console.log('Live interaction created:', interactionId);
      
      if (onSuccess) {
        onSuccess();
      } else {
        navigate(`/campaigns/${campaignId}/live-interaction`);
      }
    } catch (error) {
      console.error('Error creating live interaction:', error);
      alert('Failed to create live interaction. Please try again.');
    }
  };

  const handlePlayerCharacterToggle = (characterId: Id<"playerCharacters">) => {
    setSelectedPlayerCharacters(prev => 
      prev.includes(characterId) 
        ? prev.filter(id => id !== characterId)
        : [...prev, characterId]
    );
  };

  const handleNPCToggle = (npcId: Id<"npcs">) => {
    setSelectedNPCs(prev => 
      prev.includes(npcId) 
        ? prev.filter(id => id !== npcId)
        : [...prev, npcId]
    );
  };

  const handleMonsterToggle = (monsterId: Id<"monsters">) => {
    setSelectedMonsters(prev => 
      prev.includes(monsterId) 
        ? prev.filter(id => id !== monsterId)
        : [...prev, monsterId]
    );
  };

  const handleRewardItemToggle = (itemId: Id<"items">) => {
    setRewardItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleXpAwardChange = (characterId: Id<"playerCharacters">, xp: number) => {
    setXpAwards(prev => {
      const existing = prev.find(award => award.playerCharacterId === characterId);
      if (existing) {
        return prev.map(award => 
          award.playerCharacterId === characterId 
            ? { ...award, xp } 
            : award
        );
      } else {
        return [...prev, { playerCharacterId: characterId, xp }];
      }
    });
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      navigate(`/campaigns/${campaignId}`);
    }
  };

  if (!campaign || !playerCharacters || !npcs || !monsters || !locations || !quests || !items) {
    return (
      <div className="live-interaction-creation-form">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="live-interaction-creation-form">
      <div className="form-header">
        <h2>Create Live Interaction</h2>
        <p>Set up a new turn-based interaction for your campaign</p>
      </div>

      <form onSubmit={handleSubmit} className="interaction-form">
        {/* Basic Information */}
        <div className="form-section">
          <h3>Basic Information</h3>
          
          <div className="form-group">
            <label htmlFor="name">Interaction Name *</label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter interaction name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe the interaction scenario"
              rows={3}
            />
          </div>
        </div>

        {/* Location and Quest Linking */}
        <div className="form-section">
          <h3>Location & Quest</h3>
          
          <div className="form-group">
            <label htmlFor="location">Related Location</label>
            <select
              id="location"
              value={formData.relatedLocationId}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                relatedLocationId: e.target.value as Id<"locations"> | '' 
              }))}
            >
              <option value="">Select a location (optional)</option>
              {campaignLocations.map(location => (
                <option key={location._id} value={location._id}>
                  {location.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="quest">Related Quest</label>
            <select
              id="quest"
              value={formData.relatedQuestId}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                relatedQuestId: e.target.value as Id<"quests"> | '' 
              }))}
            >
              <option value="">Select a quest (optional)</option>
              {campaignQuests.map(quest => (
                <option key={quest._id} value={quest._id}>
                  {quest.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Participant Selection */}
        <div className="form-section">
          <h3>Participants *</h3>
          <p className="section-description">Select the characters, NPCs, and monsters that will participate in this interaction.</p>

          {/* Player Characters */}
          <div className="participant-group">
            <h4>Player Characters ({selectedPlayerCharacters.length} selected)</h4>
            <div className="participant-list">
              {campaignPlayerCharacters.length > 0 ? (
                campaignPlayerCharacters.map(character => (
                  <div 
                    key={character._id} 
                    className={`participant-item ${selectedPlayerCharacters.includes(character._id) ? 'selected' : ''}`}
                    onClick={() => handlePlayerCharacterToggle(character._id)}
                  >
                    <input
                      type="checkbox"
                      checked={selectedPlayerCharacters.includes(character._id)}
                      onChange={() => handlePlayerCharacterToggle(character._id)}
                    />
                    <div className="participant-info">
                      <div className="participant-name">{character.name}</div>
                      <div className="participant-details">
                        Level {character.level} {character.race} {character.class}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">No player characters available in this campaign</div>
              )}
            </div>
          </div>

          {/* NPCs */}
          <div className="participant-group">
            <h4>NPCs ({selectedNPCs.length} selected)</h4>
            <div className="participant-list">
              {campaignNPCs.length > 0 ? (
                campaignNPCs.map(npc => (
                  <div 
                    key={npc._id} 
                    className={`participant-item ${selectedNPCs.includes(npc._id) ? 'selected' : ''}`}
                    onClick={() => handleNPCToggle(npc._id)}
                  >
                    <input
                      type="checkbox"
                      checked={selectedNPCs.includes(npc._id)}
                      onChange={() => handleNPCToggle(npc._id)}
                    />
                    <div className="participant-info">
                      <div className="participant-name">{npc.name}</div>
                      <div className="participant-details">
                        Level {npc.level} {npc.race} {npc.class}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">No NPCs available in this campaign</div>
              )}
            </div>
          </div>

          {/* Monsters */}
          <div className="participant-group">
            <h4>Monsters ({selectedMonsters.length} selected)</h4>
            <div className="participant-list">
              {campaignMonsters.length > 0 ? (
                campaignMonsters.map(monster => (
                  <div 
                    key={monster._id} 
                    className={`participant-item ${selectedMonsters.includes(monster._id) ? 'selected' : ''}`}
                    onClick={() => handleMonsterToggle(monster._id)}
                  >
                    <input
                      type="checkbox"
                      checked={selectedMonsters.includes(monster._id)}
                      onChange={() => handleMonsterToggle(monster._id)}
                    />
                    <div className="participant-info">
                      <div className="participant-name">{monster.name}</div>
                      <div className="participant-details">
                        CR {monster.challengeRating} • {monster.type}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">No monsters available in this campaign</div>
              )}
            </div>
          </div>
        </div>

        {/* Rewards Configuration */}
        <div className="form-section">
          <h3>Rewards</h3>
          <p className="section-description">Configure rewards that will be distributed when the interaction is completed.</p>

          {/* Reward Items */}
          <div className="reward-group">
            <h4>Reward Items ({rewardItems.length} selected)</h4>
            <div className="reward-list">
              {items.length > 0 ? (
                items.map(item => (
                  <div 
                    key={item._id} 
                    className={`reward-item ${rewardItems.includes(item._id) ? 'selected' : ''}`}
                    onClick={() => handleRewardItemToggle(item._id)}
                  >
                    <input
                      type="checkbox"
                      checked={rewardItems.includes(item._id)}
                      onChange={() => handleRewardItemToggle(item._id)}
                    />
                    <div className="reward-info">
                      <div className="reward-name">{item.name}</div>
                      <div className="reward-details">
                        {item.rarity} • {item.type}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">No items available</div>
              )}
            </div>
          </div>

          {/* XP Awards */}
          {selectedPlayerCharacters.length > 0 && (
            <div className="reward-group">
              <h4>Experience Points</h4>
              <div className="xp-awards">
                {selectedPlayerCharacters.map(characterId => {
                  const character = campaignPlayerCharacters.find(c => c._id === characterId);
                  const xpAward = xpAwards.find(award => award.playerCharacterId === characterId);
                  
                  return character ? (
                    <div key={characterId} className="xp-award-item">
                      <label htmlFor={`xp-${characterId}`}>
                        {character.name}:
                      </label>
                      <input
                        type="number"
                        id={`xp-${characterId}`}
                        value={xpAward?.xp || 0}
                        onChange={(e) => handleXpAwardChange(characterId, parseInt(e.target.value) || 0)}
                        min="0"
                        placeholder="0"
                      />
                      <span className="xp-label">XP</span>
                    </div>
                  ) : null;
                })}
              </div>
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          <button type="button" onClick={handleCancel} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" className="btn-primary">
            Create Live Interaction
          </button>
        </div>
      </form>
    </div>
  );
}; 