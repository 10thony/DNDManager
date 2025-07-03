import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Id } from '../../../convex/_generated/dataModel';
import { DiceRoller } from './DiceRoller';
import { CombatStateManager } from './CombatStateManager';
import { InteractionTemplates } from './InteractionTemplates';
import './LiveInteractionDashboard.css';

interface LiveInteractionDashboardProps {
  campaignId: Id<"campaigns">;
  userId: Id<"users">;
  isDM: boolean;
}

export const LiveInteractionDashboard: React.FC<LiveInteractionDashboardProps> = ({
  campaignId,
  userId,
  isDM
}) => {
  const [selectedInteractionId, setSelectedInteractionId] = useState<Id<"interactions"> | null>(null);
  const [activeTab, setActiveTab] = useState<'main' | 'combat' | 'dice' | 'templates'>('main');
  const [showDiceRoller, setShowDiceRoller] = useState(false);

  // Queries
  const activeInteraction = useQuery(api.interactions.getActiveInteractionByCampaign, { campaignId });
  const interactionWithParticipants = useQuery(
    api.interactions.getInteractionWithParticipants,
    selectedInteractionId ? { interactionId: selectedInteractionId } : 'skip'
  );
  const initiativeOrder = useQuery(
    api.interactions.getInitiativeOrder,
    selectedInteractionId ? { interactionId: selectedInteractionId } : 'skip'
  );
  const pendingActions = useQuery(
    api.playerActions.getPendingPlayerActions,
    selectedInteractionId ? { interactionId: selectedInteractionId } : 'skip'
  );

  // Mutations
  const advanceTurn = useMutation(api.interactions.advanceTurn);
  const completeInteraction = useMutation(api.interactions.completeInteraction);
  const cancelInteraction = useMutation(api.interactions.cancelInteraction);

  useEffect(() => {
    if (activeInteraction) {
      setSelectedInteractionId(activeInteraction._id);
    }
  }, [activeInteraction]);

  const handleAdvanceTurn = async () => {
    if (selectedInteractionId) {
      try {
        await advanceTurn({ interactionId: selectedInteractionId });
      } catch (error) {
        console.error('Error advancing turn:', error);
      }
    }
  };

  const handleCompleteInteraction = async () => {
    if (selectedInteractionId) {
      try {
        await completeInteraction({ interactionId: selectedInteractionId });
        setSelectedInteractionId(null);
      } catch (error) {
        console.error('Error completing interaction:', error);
      }
    }
  };

  const handleCancelInteraction = async () => {
    if (selectedInteractionId) {
      try {
        await cancelInteraction({ interactionId: selectedInteractionId });
        setSelectedInteractionId(null);
      } catch (error) {
        console.error('Error cancelling interaction:', error);
      }
    }
  };

  if (!activeInteraction) {
    return (
      <div className="live-interaction-dashboard">
        <div className="no-active-interaction">
          <h2>No Active Interaction</h2>
          <p>There is currently no active live interaction for this campaign.</p>
          {isDM && (
            <button className="btn-primary">
              Start New Interaction
            </button>
          )}
        </div>
      </div>
    );
  }

  const currentParticipant = initiativeOrder?.currentParticipant;
  const isCurrentTurnPlayer = currentParticipant?.entityType === 'playerCharacter';

  return (
    <div className="live-interaction-dashboard">
      <div className="dashboard-header">
        <h2>Live Interaction: {activeInteraction.name}</h2>
        <div className="interaction-status">
          Status: <span className={`status-${activeInteraction.status?.toLowerCase()}`}>
            {activeInteraction.status?.replace(/_/g, ' ')}
          </span>
        </div>
      </div>

      {/* Advanced Features Tabs */}
      <div className="advanced-features-tabs">
        <button
          className={`tab-button ${activeTab === 'main' ? 'active' : ''}`}
          onClick={() => setActiveTab('main')}
        >
          📊 Main Dashboard
        </button>
        <button
          className={`tab-button ${activeTab === 'combat' ? 'active' : ''}`}
          onClick={() => setActiveTab('combat')}
        >
          ⚔️ Combat State
        </button>
        <button
          className={`tab-button ${activeTab === 'dice' ? 'active' : ''}`}
          onClick={() => setActiveTab('dice')}
        >
          🎲 Dice Roller
        </button>
        <button
          className={`tab-button ${activeTab === 'templates' ? 'active' : ''}`}
          onClick={() => setActiveTab('templates')}
        >
          📋 Templates
        </button>
      </div>

      <div className="dashboard-content">
        {/* Main Dashboard Tab */}
        {activeTab === 'main' && (
          <div className="main-panel">
            {/* Initiative Order */}
            <div className="initiative-panel">
              <h3>Initiative Order</h3>
              <div className="initiative-list">
                {initiativeOrder?.initiativeOrder.map((participant, index) => (
                  <div
                    key={`${participant.entityId}-${index}`}
                    className={`initiative-item ${index === initiativeOrder.currentIndex ? 'current-turn' : ''}`}
                  >
                    <div className="initiative-number">{index + 1}</div>
                    <div className="participant-info">
                      <div className="participant-name">
                        {participant.entityType === 'playerCharacter' && 
                          interactionWithParticipants?.participants.playerCharacters.find(
                            pc => pc._id === participant.entityId
                          )?.name || 'Unknown Player'}
                        {participant.entityType === 'npc' && 
                          interactionWithParticipants?.participants.npcs.find(
                            npc => npc._id === participant.entityId
                          )?.name || 'Unknown NPC'}
                        {participant.entityType === 'monster' && 
                          interactionWithParticipants?.participants.monsters.find(
                            monster => monster._id === participant.entityId
                          )?.name || 'Unknown Monster'}
                      </div>
                      <div className="participant-type">{participant.entityType}</div>
                    </div>
                    <div className="initiative-roll">{participant.initiativeRoll}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Current Turn Display */}
            <div className="current-turn-panel">
              <h3>Current Turn</h3>
              {currentParticipant ? (
                <div className="current-participant">
                  <div className="participant-name">
                    {currentParticipant.entityType === 'playerCharacter' && 
                      interactionWithParticipants?.participants.playerCharacters.find(
                        pc => pc._id === currentParticipant.entityId
                      )?.name || 'Unknown Player'}
                    {currentParticipant.entityType === 'npc' && 
                      interactionWithParticipants?.participants.npcs.find(
                        npc => npc._id === currentParticipant.entityId
                      )?.name || 'Unknown NPC'}
                    {currentParticipant.entityType === 'monster' && 
                      interactionWithParticipants?.participants.monsters.find(
                        monster => monster._id === currentParticipant.entityId
                      )?.name || 'Unknown Monster'}
                  </div>
                  <div className="participant-type">{currentParticipant.entityType}</div>
                  <div className="initiative-roll">Initiative: {currentParticipant.initiativeRoll}</div>
                </div>
              ) : (
                <div className="no-current-turn">No current turn</div>
              )}
            </div>

            {/* Action Queue */}
            <div className="action-queue-panel">
              <h3>Pending Actions ({pendingActions?.length || 0})</h3>
              <div className="action-list">
                {pendingActions?.map((action) => (
                  <div key={action._id} className="action-item">
                    <div className="action-header">
                      <span className="action-type">{action.actionType}</span>
                      <span className="action-time">
                        {new Date(action.submittedAt).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="action-description">{action.actionDescription}</div>
                  </div>
                ))}
                {(!pendingActions || pendingActions.length === 0) && (
                  <div className="no-pending-actions">No pending actions</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Combat State Tab */}
        {activeTab === 'combat' && selectedInteractionId && (
          <div className="combat-panel">
            <CombatStateManager interactionId={selectedInteractionId} />
          </div>
        )}

        {/* Dice Roller Tab */}
        {activeTab === 'dice' && (
          <div className="dice-panel">
            <DiceRoller
              mode="combat"
              interactionId={selectedInteractionId}
              onRollComplete={(result) => {
                console.log('Dice roll result:', result);
                // TODO: Integrate with combat state
              }}
            />
          </div>
        )}

        {/* Templates Tab */}
        {activeTab === 'templates' && (
          <div className="templates-panel">
            <InteractionTemplates
              campaignId={campaignId}
              onTemplateSelect={(template) => {
                console.log('Template selected:', template);
                // TODO: Apply template to current interaction
              }}
            />
          </div>
        )}

        {/* Control Panel - Always visible */}
        <div className="control-panel">
          <h3>Controls</h3>
          
          {isDM && (
            <>
              <button 
                className="btn-primary"
                onClick={handleAdvanceTurn}
                disabled={!selectedInteractionId}
              >
                Advance Turn
              </button>
              
              <button 
                className="btn-success"
                onClick={handleCompleteInteraction}
                disabled={!selectedInteractionId}
              >
                Complete Interaction
              </button>
              
              <button 
                className="btn-danger"
                onClick={handleCancelInteraction}
                disabled={!selectedInteractionId}
              >
                Cancel Interaction
              </button>
            </>
          )}

          {!isDM && isCurrentTurnPlayer && (
            <div className="player-turn-notice">
              <p>It's your turn!</p>
              <button className="btn-primary">
                Submit Action
              </button>
            </div>
          )}

          {!isDM && !isCurrentTurnPlayer && (
            <div className="waiting-notice">
              <p>Waiting for current player's turn...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 