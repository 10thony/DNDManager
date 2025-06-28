import React, { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { useNavigate } from "react-router-dom";
import { api } from "../../../convex/_generated/api";
import { useUser } from "@clerk/clerk-react";
import { CampaignValidationState, CampaignCreationRequirements } from "../../schemas/campaign";
import "./CampaignCreationForm.css";

const CampaignCreationForm: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  
  // Basic campaign info
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    worldSetting: "",
    isPublic: false,
  });

  // Timeline events
  const [timelineEvents, setTimelineEvents] = useState<Array<{
    title: string;
    description: string;
    date: number;
    type: string;
  }>>([]);
  const [isAddingTimelineEvent, setIsAddingTimelineEvent] = useState(false);
  const [newTimelineEvent, setNewTimelineEvent] = useState({
    title: "",
    description: "",
    date: new Date().getTime(),
    type: "Custom",
  });

  // Player characters
  const [selectedPlayerCharacters, setSelectedPlayerCharacters] = useState<string[]>([]);
  const playerCharacters = useQuery(api.characters.getAllCharacters);

  // NPCs
  const [selectedNPCs, setSelectedNPCs] = useState<string[]>([]);
  const npcs = useQuery(api.npcs.getAllNpcs);

  // Quests
  const [selectedQuests, setSelectedQuests] = useState<string[]>([]);
  const quests = useQuery(api.quests.getAllQuests);

  // Locations
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const locations = useQuery(api.locations.list);

  // Boss monsters
  const [selectedBossMonsters, setSelectedBossMonsters] = useState<string[]>([]);
  const monsters = useQuery(api.monsters.getAllMonsters);

  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createCampaign = useMutation(api.campaigns.createCampaign);
  const createTimelineEvent = useMutation(api.timelineEvents.createTimelineEvent);
  const addTimelineEventToCampaign = useMutation(api.campaigns.addTimelineEventToCampaign);

  const requirements: CampaignCreationRequirements = {
    timelineEventsRequired: 3,
    playerCharactersRequired: 1,
    npcsRequired: 1,
    questsRequired: 1,
    interactionsRequired: 1,
    locationsRequired: 1,
    bossMonstersRequired: 1,
  };

  // Calculate validation state
  const getValidationState = (): CampaignValidationState => {
    const bossMonsterCount = monsters ? 
      monsters.filter(monster => {
        const cr = parseFloat(monster.challengeRating);
        return selectedBossMonsters.includes(monster._id) && !isNaN(cr) && cr >= 10;
      }).length : 0;

    return {
      hasName: !!formData.name.trim(),
      hasTimelineEvents: timelineEvents.length >= requirements.timelineEventsRequired,
      hasPlayerCharacters: selectedPlayerCharacters.length >= requirements.playerCharactersRequired,
      hasNPCs: selectedNPCs.length >= requirements.npcsRequired,
      hasQuests: selectedQuests.length >= requirements.questsRequired,
      hasInteractions: false, // TODO: Implement interactions
      hasLocations: selectedLocations.length >= requirements.locationsRequired,
      hasBossMonsters: bossMonsterCount >= requirements.bossMonstersRequired,
    };
  };

  const validationState = getValidationState();
  const isFormComplete = Object.values(validationState).every(Boolean);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTimelineEventChange = (field: string, value: any) => {
    setNewTimelineEvent(prev => ({ ...prev, [field]: value }));
  };

  const addTimelineEvent = () => {
    if (!newTimelineEvent.title.trim() || !newTimelineEvent.description.trim()) {
      setErrors(["Timeline event title and description are required"]);
      return;
    }

    if (timelineEvents.length >= requirements.timelineEventsRequired) {
      setErrors([`Maximum of ${requirements.timelineEventsRequired} timeline events allowed`]);
      return;
    }

    setTimelineEvents(prev => [...prev, { ...newTimelineEvent }]);
    setNewTimelineEvent({
      title: "",
      description: "",
      date: new Date().getTime(),
      type: "Custom",
    });
    setIsAddingTimelineEvent(false);
    setErrors([]);
  };

  const removeTimelineEvent = (index: number) => {
    setTimelineEvents(prev => prev.filter((_, i) => i !== index));
  };

  const editTimelineEvent = (index: number) => {
    const event = timelineEvents[index];
    setNewTimelineEvent({ ...event });
    setTimelineEvents(prev => prev.filter((_, i) => i !== index));
    setIsAddingTimelineEvent(true);
  };

  const validateForm = (): boolean => {
    const newErrors: string[] = [];
    
    if (!formData.name.trim()) {
      newErrors.push("Campaign name is required");
    }
    
    if (timelineEvents.length < requirements.timelineEventsRequired) {
      newErrors.push(`At least ${requirements.timelineEventsRequired} timeline events are required`);
    }
    
    if (selectedPlayerCharacters.length < requirements.playerCharactersRequired) {
      newErrors.push(`At least ${requirements.playerCharactersRequired} player character is required`);
    }
    
    if (selectedNPCs.length < requirements.npcsRequired) {
      newErrors.push(`At least ${requirements.npcsRequired} NPC is required`);
    }
    
    if (selectedQuests.length < requirements.questsRequired) {
      newErrors.push(`At least ${requirements.questsRequired} quest is required`);
    }
    
    if (selectedLocations.length < requirements.locationsRequired) {
      newErrors.push(`At least ${requirements.locationsRequired} location is required`);
    }
    
    const bossMonsterCount = monsters ? 
      monsters.filter(monster => {
        const cr = parseFloat(monster.challengeRating);
        return selectedBossMonsters.includes(monster._id) && !isNaN(cr) && cr >= 10;
      }).length : 0;
    
    if (bossMonsterCount < requirements.bossMonstersRequired) {
      newErrors.push(`At least ${requirements.bossMonstersRequired} boss monster (CR 10+) is required`);
    }
    
    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !user) return;

    setIsSubmitting(true);
    try {
      // Create the campaign first
      const campaignId = await createCampaign({
        name: formData.name,
        creatorId: user.id as any,
        description: formData.description || undefined,
        worldSetting: formData.worldSetting || undefined,
        isPublic: formData.isPublic,
      });

      // Create timeline events and add them to the campaign
      for (const event of timelineEvents) {
        const eventId = await createTimelineEvent({
          campaignId,
          title: event.title,
          description: event.description,
          date: event.date,
          type: event.type as any,
        });

        await addTimelineEventToCampaign({
          campaignId,
          timelineEventId: eventId,
        });
      }

      // TODO: Add other entities to the campaign
      // This would require additional mutations to add player characters, NPCs, etc.
      
      navigate(`/campaigns/${campaignId}`);
    } catch (error) {
      console.error("Error creating campaign:", error);
      setErrors(["Failed to create campaign. Please try again."]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate("/campaigns");
  };

  // Navigation functions for creating new entities
  const navigateToCreateCharacter = () => {
    navigate("/characters/create");
  };

  const navigateToCreateNPC = () => {
    navigate("/npcs/create");
  };

  const navigateToCreateQuest = () => {
    navigate("/quests/create");
  };

  const navigateToCreateLocation = () => {
    navigate("/locations/new");
  };

  const navigateToCreateMonster = () => {
    navigate("/monsters/create");
  };

  // Navigation functions for editing entities
  const navigateToEditCharacter = (characterId: string) => {
    navigate(`/characters/${characterId}/edit`);
  };

  const navigateToEditNPC = (npcId: string) => {
    navigate(`/npcs/${npcId}/edit`);
  };

  const navigateToEditQuest = (questId: string) => {
    navigate(`/quests/${questId}/edit`);
  };

  const navigateToEditLocation = (locationId: string) => {
    navigate(`/locations/${locationId}/edit`);
  };

  const navigateToEditMonster = (monsterId: string) => {
    navigate(`/monsters/${monsterId}/edit`);
  };

  // Navigation functions for viewing entities
  const navigateToViewCharacter = (characterId: string) => {
    navigate(`/characters/${characterId}`);
  };

  const navigateToViewNPC = (npcId: string) => {
    navigate(`/npcs/${npcId}`);
  };

  const navigateToViewQuest = (questId: string) => {
    navigate(`/quests/${questId}`);
  };

  const navigateToViewLocation = (locationId: string) => {
    navigate(`/locations/${locationId}`);
  };

  const navigateToViewMonster = (monsterId: string) => {
    navigate(`/monsters/${monsterId}`);
  };

  return (
    <div className="campaign-creation-container">
      <div className="creation-header">
        <div className="header-content">
          <h2 className="creation-title">Create New Campaign</h2>
          <p className="creation-subtitle">
            Set up your D&D campaign with all required elements
          </p>
        </div>
        <button className="back-button" onClick={handleCancel}>
          ← Back to Campaigns
        </button>
      </div>

      {errors.length > 0 && (
        <div className="form-errors">
          {errors.map((error, index) => (
            <div key={index} className="error-message">{error}</div>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="creation-form">
        <div className="sections-grid">
          {/* Basic Information Section */}
          <div className="form-section">
            <h3 className="section-title">📋 Basic Information</h3>
            
            <div className="form-row">
              <div className="form-col">
                <label className="form-label">Campaign Name *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Enter campaign name"
                  required
                />
              </div>
              <div className="form-col">
                <label className="form-label">Visibility</label>
                <div className="toggle-container">
                  <label className="toggle-label">
                    <input
                      type="checkbox"
                      className="toggle-input"
                      checked={formData.isPublic}
                      onChange={(e) => handleInputChange("isPublic", e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                    <span className="toggle-text">
                      {formData.isPublic ? "Public" : "Private"}
                    </span>
                  </label>
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-col">
                <label className="form-label">Description</label>
                <textarea
                  className="form-textarea"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Enter campaign description"
                  rows={3}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-col">
                <label className="form-label">World Setting</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.worldSetting}
                  onChange={(e) => handleInputChange("worldSetting", e.target.value)}
                  placeholder="Enter world setting (e.g., Forgotten Realms, Homebrew)"
                />
              </div>
            </div>
          </div>

          {/* Timeline Events Section */}
          <div className="form-section">
            <h3 className="section-title">📅 Timeline Events ({timelineEvents.length}/{requirements.timelineEventsRequired})</h3>
            <p className="section-description">Create at least {requirements.timelineEventsRequired} timeline events for your campaign.</p>
            
            {timelineEvents.map((event, index) => (
              <div key={index} className="timeline-event-item">
                <div className="event-header">
                  <span className="event-title">{event.title}</span>
                  <div className="event-actions">
                    <button 
                      type="button"
                      className="edit-button"
                      onClick={() => editTimelineEvent(index)}
                    >
                      ✏️ Edit
                    </button>
                    <button 
                      type="button"
                      className="remove-button"
                      onClick={() => removeTimelineEvent(index)}
                    >
                      ❌ Remove
                    </button>
                  </div>
                </div>
                <div className="event-details">
                  <span className="event-type">{event.type}</span>
                  <span className="event-date">{new Date(event.date).toLocaleDateString()}</span>
                </div>
                <div className="event-description">{event.description}</div>
              </div>
            ))}

            {!isAddingTimelineEvent && timelineEvents.length < requirements.timelineEventsRequired && (
              <button 
                type="button"
                className="add-button"
                onClick={() => setIsAddingTimelineEvent(true)}
              >
                ➕ Add Timeline Event
              </button>
            )}

            {isAddingTimelineEvent && (
              <div className="timeline-event-form">
                <div className="form-row">
                  <div className="form-col">
                    <label className="form-label">Event Title *</label>
                    <input
                      type="text"
                      className="form-input"
                      value={newTimelineEvent.title}
                      onChange={(e) => handleTimelineEventChange("title", e.target.value)}
                      placeholder="Enter event title"
                    />
                  </div>
                  <div className="form-col">
                    <label className="form-label">Event Type</label>
                    <select
                      className="form-select"
                      value={newTimelineEvent.type}
                      onChange={(e) => handleTimelineEventChange("type", e.target.value)}
                    >
                      <option value="Custom">Custom</option>
                      <option value="Battle">Battle</option>
                      <option value="Alliance">Alliance</option>
                      <option value="Discovery">Discovery</option>
                      <option value="Disaster">Disaster</option>
                      <option value="Political">Political</option>
                      <option value="Cultural">Cultural</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-col">
                    <label className="form-label">Date</label>
                    <input
                      type="date"
                      className="form-input"
                      value={new Date(newTimelineEvent.date).toISOString().split('T')[0]}
                      onChange={(e) => handleTimelineEventChange("date", new Date(e.target.value).getTime())}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-col">
                    <label className="form-label">Description *</label>
                    <textarea
                      className="form-textarea"
                      value={newTimelineEvent.description}
                      onChange={(e) => handleTimelineEventChange("description", e.target.value)}
                      placeholder="Enter event description"
                      rows={3}
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <button 
                    type="button"
                    className="save-button"
                    onClick={addTimelineEvent}
                  >
                    💾 Add Event
                  </button>
                  <button 
                    type="button"
                    className="cancel-button"
                    onClick={() => {
                      setIsAddingTimelineEvent(false);
                      setNewTimelineEvent({
                        title: "",
                        description: "",
                        date: new Date().getTime(),
                        type: "Custom",
                      });
                    }}
                  >
                    ❌ Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Player Characters Section */}
          <div className="form-section">
            <h3 className="section-title">👤 Player Characters ({selectedPlayerCharacters.length}/{requirements.playerCharactersRequired})</h3>
            <p className="section-description">Select at least {requirements.playerCharactersRequired} player character for your campaign.</p>
            
            <div className="section-actions">
              <button 
                type="button"
                className="create-button"
                onClick={navigateToCreateCharacter}
              >
                ➕ Create New Character
              </button>
            </div>
            
            {playerCharacters && playerCharacters.length > 0 ? (
              <div className="selection-grid">
                {playerCharacters.map((character) => (
                  <div 
                    key={character._id}
                    className={`selection-item ${selectedPlayerCharacters.includes(character._id) ? 'selected' : ''}`}
                  >
                    <div 
                      className="item-content"
                      onClick={() => {
                        if (selectedPlayerCharacters.includes(character._id)) {
                          setSelectedPlayerCharacters(prev => prev.filter(id => id !== character._id));
                        } else {
                          setSelectedPlayerCharacters(prev => [...prev, character._id]);
                        }
                      }}
                    >
                      <div className="item-name">{character.name}</div>
                      <div className="item-details">
                        Level {character.level} {character.race} {character.class}
                      </div>
                    </div>
                    <div className="item-actions">
                      <button 
                        type="button"
                        className="view-button"
                        onClick={() => navigateToViewCharacter(character._id)}
                      >
                        👁️ View
                      </button>
                      <button 
                        type="button"
                        className="edit-button"
                        onClick={() => navigateToEditCharacter(character._id)}
                      >
                        ✏️ Edit
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>No player characters found. Create some characters first!</p>
                <button 
                  type="button"
                  className="create-button"
                  onClick={navigateToCreateCharacter}
                >
                  Create Character
                </button>
              </div>
            )}
          </div>

          {/* NPCs Section */}
          <div className="form-section">
            <h3 className="section-title">🎭 NPCs ({selectedNPCs.length}/{requirements.npcsRequired})</h3>
            <p className="section-description">Select at least {requirements.npcsRequired} NPC for your campaign.</p>
            
            <div className="section-actions">
              <button 
                type="button"
                className="create-button"
                onClick={navigateToCreateNPC}
              >
                ➕ Create New NPC
              </button>
            </div>
            
            {npcs && npcs.length > 0 ? (
              <div className="selection-grid">
                {npcs.map((npc) => (
                  <div 
                    key={npc._id}
                    className={`selection-item ${selectedNPCs.includes(npc._id) ? 'selected' : ''}`}
                  >
                    <div 
                      className="item-content"
                      onClick={() => {
                        if (selectedNPCs.includes(npc._id)) {
                          setSelectedNPCs(prev => prev.filter(id => id !== npc._id));
                        } else {
                          setSelectedNPCs(prev => [...prev, npc._id]);
                        }
                      }}
                    >
                      <div className="item-name">{npc.name}</div>
                      <div className="item-details">
                        {npc.race} • {npc.alignment || 'Unknown'}
                      </div>
                    </div>
                    <div className="item-actions">
                      <button 
                        type="button"
                        className="view-button"
                        onClick={() => navigateToViewNPC(npc._id)}
                      >
                        👁️ View
                      </button>
                      <button 
                        type="button"
                        className="edit-button"
                        onClick={() => navigateToEditNPC(npc._id)}
                      >
                        ✏️ Edit
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>No NPCs found. Create some NPCs first!</p>
                <button 
                  type="button"
                  className="create-button"
                  onClick={navigateToCreateNPC}
                >
                  Create NPC
                </button>
              </div>
            )}
          </div>

          {/* Quests Section */}
          <div className="form-section">
            <h3 className="section-title">📜 Quests ({selectedQuests.length}/{requirements.questsRequired})</h3>
            <p className="section-description">Select at least {requirements.questsRequired} quest for your campaign.</p>
            
            <div className="section-actions">
              <button 
                type="button"
                className="create-button"
                onClick={navigateToCreateQuest}
              >
                ➕ Create New Quest
              </button>
            </div>
            
            {quests && quests.length > 0 ? (
              <div className="selection-grid">
                {quests.map((quest) => (
                  <div 
                    key={quest._id}
                    className={`selection-item ${selectedQuests.includes(quest._id) ? 'selected' : ''}`}
                  >
                    <div 
                      className="item-content"
                      onClick={() => {
                        if (selectedQuests.includes(quest._id)) {
                          setSelectedQuests(prev => prev.filter(id => id !== quest._id));
                        } else {
                          setSelectedQuests(prev => [...prev, quest._id]);
                        }
                      }}
                    >
                      <div className="item-name">{quest.name}</div>
                      <div className="item-details">
                        {quest.description?.substring(0, 50)}...
                      </div>
                    </div>
                    <div className="item-actions">
                      <button 
                        type="button"
                        className="view-button"
                        onClick={() => navigateToViewQuest(quest._id)}
                      >
                        👁️ View
                      </button>
                      <button 
                        type="button"
                        className="edit-button"
                        onClick={() => navigateToEditQuest(quest._id)}
                      >
                        ✏️ Edit
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>No quests found. Create some quests first!</p>
                <button 
                  type="button"
                  className="create-button"
                  onClick={navigateToCreateQuest}
                >
                  Create Quest
                </button>
              </div>
            )}
          </div>

          {/* Locations Section */}
          <div className="form-section">
            <h3 className="section-title">🗺️ Locations ({selectedLocations.length}/{requirements.locationsRequired})</h3>
            <p className="section-description">Select at least {requirements.locationsRequired} location for your campaign.</p>
            
            <div className="section-actions">
              <button 
                type="button"
                className="create-button"
                onClick={navigateToCreateLocation}
              >
                ➕ Create New Location
              </button>
            </div>
            
            {locations && locations.length > 0 ? (
              <div className="selection-grid">
                {locations.map((location) => (
                  <div 
                    key={location._id}
                    className={`selection-item ${selectedLocations.includes(location._id) ? 'selected' : ''}`}
                  >
                    <div 
                      className="item-content"
                      onClick={() => {
                        if (selectedLocations.includes(location._id)) {
                          setSelectedLocations(prev => prev.filter(id => id !== location._id));
                        } else {
                          setSelectedLocations(prev => [...prev, location._id]);
                        }
                      }}
                    >
                      <div className="item-name">{location.name}</div>
                      <div className="item-details">
                        {location.type} • {location.description?.substring(0, 30)}...
                      </div>
                    </div>
                    <div className="item-actions">
                      <button 
                        type="button"
                        className="view-button"
                        onClick={() => navigateToViewLocation(location._id)}
                      >
                        👁️ View
                      </button>
                      <button 
                        type="button"
                        className="edit-button"
                        onClick={() => navigateToEditLocation(location._id)}
                      >
                        ✏️ Edit
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>No locations found. Create some locations first!</p>
                <button 
                  type="button"
                  className="create-button"
                  onClick={navigateToCreateLocation}
                >
                  Create Location
                </button>
              </div>
            )}
          </div>

          {/* Boss Monsters Section */}
          <div className="form-section">
            <h3 className="section-title">🐉 Boss Monsters ({monsters ? monsters.filter(m => {
              const cr = parseFloat(m.challengeRating);
              return selectedBossMonsters.includes(m._id) && !isNaN(cr) && cr >= 10;
            }).length : 0}/{requirements.bossMonstersRequired})</h3>
            <p className="section-description">Select at least {requirements.bossMonstersRequired} boss monster (CR 10 or higher) for your campaign.</p>
            
            <div className="section-actions">
              <button 
                type="button"
                className="create-button"
                onClick={navigateToCreateMonster}
              >
                ➕ Create New Monster
              </button>
            </div>
            
            {monsters && monsters.length > 0 ? (
              <div className="selection-grid">
                {monsters
                  .filter(monster => {
                    const cr = parseFloat(monster.challengeRating);
                    return !isNaN(cr) && cr >= 10;
                  })
                  .map((monster) => (
                    <div 
                      key={monster._id}
                      className={`selection-item ${selectedBossMonsters.includes(monster._id) ? 'selected' : ''}`}
                    >
                      <div 
                        className="item-content"
                        onClick={() => {
                          if (selectedBossMonsters.includes(monster._id)) {
                            setSelectedBossMonsters(prev => prev.filter(id => id !== monster._id));
                          } else {
                            setSelectedBossMonsters(prev => [...prev, monster._id]);
                          }
                        }}
                      >
                        <div className="item-name">{monster.name}</div>
                        <div className="item-details">
                          CR {monster.challengeRating} • {monster.type}
                        </div>
                      </div>
                      <div className="item-actions">
                        <button 
                          type="button"
                          className="view-button"
                          onClick={() => navigateToViewMonster(monster._id)}
                        >
                          👁️ View
                        </button>
                        <button 
                          type="button"
                          className="edit-button"
                          onClick={() => navigateToEditMonster(monster._id)}
                        >
                          ✏️ Edit
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>No boss monsters found. Create some high-level monsters first!</p>
                <button 
                  type="button"
                  className="create-button"
                  onClick={navigateToCreateMonster}
                >
                  Create Monster
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="cancel-button"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          
          <button
            type="submit"
            className={`create-button ${isFormComplete ? 'enabled' : 'disabled'}`}
            disabled={isSubmitting || !isFormComplete}
          >
            {isSubmitting ? "Creating..." : isFormComplete ? "Create Campaign" : "Complete Requirements"}
          </button>
        </div>
      </form>

      {/* Requirements Summary */}
      <div className="requirements-summary">
        <h4>Campaign Requirements:</h4>
        <div className="requirements-grid">
          <div className={`requirement ${validationState.hasName ? 'complete' : 'incomplete'}`}>
            <span className="requirement-icon">{validationState.hasName ? '✅' : '❌'}</span>
            <span className="requirement-text">Campaign name</span>
          </div>
          <div className={`requirement ${validationState.hasTimelineEvents ? 'complete' : 'incomplete'}`}>
            <span className="requirement-icon">{validationState.hasTimelineEvents ? '✅' : '❌'}</span>
            <span className="requirement-text">Timeline events ({timelineEvents.length}/{requirements.timelineEventsRequired})</span>
          </div>
          <div className={`requirement ${validationState.hasPlayerCharacters ? 'complete' : 'incomplete'}`}>
            <span className="requirement-icon">{validationState.hasPlayerCharacters ? '✅' : '❌'}</span>
            <span className="requirement-text">Player characters ({selectedPlayerCharacters.length}/{requirements.playerCharactersRequired})</span>
          </div>
          <div className={`requirement ${validationState.hasNPCs ? 'complete' : 'incomplete'}`}>
            <span className="requirement-icon">{validationState.hasNPCs ? '✅' : '❌'}</span>
            <span className="requirement-text">NPCs ({selectedNPCs.length}/{requirements.npcsRequired})</span>
          </div>
          <div className={`requirement ${validationState.hasQuests ? 'complete' : 'incomplete'}`}>
            <span className="requirement-icon">{validationState.hasQuests ? '✅' : '❌'}</span>
            <span className="requirement-text">Quests ({selectedQuests.length}/{requirements.questsRequired})</span>
          </div>
          <div className={`requirement ${validationState.hasLocations ? 'complete' : 'incomplete'}`}>
            <span className="requirement-icon">{validationState.hasLocations ? '✅' : '❌'}</span>
            <span className="requirement-text">Locations ({selectedLocations.length}/{requirements.locationsRequired})</span>
          </div>
          <div className={`requirement ${validationState.hasBossMonsters ? 'complete' : 'incomplete'}`}>
            <span className="requirement-icon">{validationState.hasBossMonsters ? '✅' : '❌'}</span>
            <span className="requirement-text">Boss monsters ({monsters ? monsters.filter(m => {
              const cr = parseFloat(m.challengeRating);
              return selectedBossMonsters.includes(m._id) && !isNaN(cr) && cr >= 10;
            }).length : 0}/{requirements.bossMonstersRequired})</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignCreationForm; 