# Live Interaction System Development Plan

## Overview
This document outlines the development plan for implementing a turn-based live interaction system for the DND Manager application. The system will enable real-time, turn-based interactions between DMs and players during D&D sessions.

## Current State Analysis

### Existing Infrastructure
- **Database Schema**: Basic `interactions` table exists but lacks turn-based functionality
- **UI Components**: Basic interaction creation and management components exist
- **Routing**: Interactions are currently admin-only routes
- **Authentication**: ClerkAuth integration with role-based access control

### Missing Components
- Turn-based interaction lifecycle management
- Initiative system
- Player action submission and validation
- Real-time DM action review system
- Live interaction UI components
- Campaign-active interaction tracking

## Phase 1: Database Schema Updates

### 1.1 Update Interactions Table Schema
**File**: `convex/schema.ts`

**Changes Required**:
```typescript
interactions: defineTable({
  // Existing fields...
  name: v.string(),
  description: v.optional(v.string()),
  creatorId: v.id("users"),
  campaignId: v.optional(v.id("campaigns")),
  
  // NEW FIELDS FOR LIVE INTERACTIONS
  dmUserId: v.id("users"), // DM controlling the interaction
  relatedLocationId: v.optional(v.id("locations")), // Rename from questId
  relatedQuestId: v.optional(v.id("quests")), // Keep for quest linking
  status: v.union(
    v.literal("PENDING_INITIATIVE"),
    v.literal("INITIATIVE_ROLLED"), 
    v.literal("WAITING_FOR_PLAYER_TURN"),
    v.literal("PROCESSING_PLAYER_ACTION"),
    v.literal("DM_REVIEW"),
    v.literal("COMPLETED"),
    v.literal("CANCELLED")
  ),
  initiativeOrder: v.optional(v.array(v.object({
    entityId: v.string(),
    entityType: v.union(v.literal("playerCharacter"), v.literal("npc"), v.literal("monster")),
    initiativeRoll: v.number()
  }))),
  currentInitiativeIndex: v.optional(v.number()),
  participantMonsterIds: v.optional(v.array(v.id("monsters"))),
  participantNpcIds: v.optional(v.array(v.id("npcs"))),
  participantPlayerCharacterIds: v.optional(v.array(v.id("playerCharacters"))),
  interactionLog: v.optional(v.array(v.any())),
  interactionState: v.optional(v.any()),
  rewardItemIds: v.optional(v.array(v.id("items"))),
  xpAwards: v.optional(v.array(v.object({
    playerCharacterId: v.id("playerCharacters"),
    xp: v.number()
  }))),
  createdAt: v.number(),
  updatedAt: v.optional(v.number()),
}),
```

### 1.2 Create PlayerActions Table
**File**: `convex/schema.ts`

**New Table**:
```typescript
playerActions: defineTable({
  interactionId: v.id("interactions"),
  playerCharacterId: v.id("playerCharacters"),
  actionDescription: v.string(),
  actionType: v.union(
    v.literal("Dialogue"),
    v.literal("CombatAction"), 
    v.literal("PuzzleInput"),
    v.literal("Custom")
  ),
  submittedAt: v.number(),
  status: v.union(
    v.literal("PENDING"),
    v.literal("DM_REVIEW"),
    v.literal("RESOLVED"),
    v.literal("SKIPPED")
  ),
  dmNotes: v.optional(v.string()),
  associatedItemId: v.optional(v.id("items")),
  createdAt: v.number(),
}),
```

### 1.3 Update Campaigns Table
**File**: `convex/schema.ts`

**Add Field**:
```typescript
campaigns: defineTable({
  // Existing fields...
  activeInteractionId: v.optional(v.id("interactions")), // NEW FIELD
  // ... rest of existing fields
}),
```

## Phase 2: Backend API Development

### 2.1 Create Live Interaction Mutations
**File**: `convex/interactions.ts`

**New Functions**:
- `startInteraction()` - DM initiates live interaction
- `rollInitiative()` - DM rolls initiative for all participants
- `submitPlayerAction()` - Player submits action on their turn
- `resolvePlayerAction()` - DM reviews and resolves player actions
- `advanceTurn()` - Move to next participant in initiative order
- `completeInteraction()` - End the interaction and distribute rewards
- `cancelInteraction()` - Cancel ongoing interaction

### 2.2 Create Live Interaction Queries
**File**: `convex/interactions.ts`

**New Functions**:
- `getActiveInteractionByCampaign()` - Get current active interaction
- `getInteractionWithParticipants()` - Get interaction with full participant details
- `getPendingPlayerActions()` - Get actions awaiting DM review
- `getInitiativeOrder()` - Get current initiative order and active participant

### 2.3 Create PlayerActions API
**File**: `convex/playerActions.ts` (NEW FILE)

**Functions**:
- `createPlayerAction()` - Create new player action
- `updatePlayerAction()` - Update action status/notes
- `getPlayerActionsByInteraction()` - Get all actions for an interaction
- `getPlayerActionsByCharacter()` - Get actions for specific character

## Phase 3: Frontend Component Development

### 3.1 Live Interaction Dashboard
**File**: `src/components/live-interactions/LiveInteractionDashboard.tsx` (NEW)

**Features**:
- Real-time interaction status display
- Initiative order visualization
- Current participant highlight
- Turn management controls (DM only)
- Action queue display

### 3.2 Player Action Interface
**File**: `src/components/live-interactions/PlayerActionInterface.tsx` (NEW)

**Features**:
- Turn notification system
- Action submission form
- Action type selection (Dialogue, Combat, etc.)
- Character-specific action history

### 3.3 DM Action Review Panel
**File**: `src/components/live-interactions/DMActionReviewPanel.tsx` (NEW)

**Features**:
- Pending actions queue
- Action approval/denial interface
- Dice rolling integration
- Reward distribution system
- XP award management

### 3.4 Initiative Management
**File**: `src/components/live-interactions/InitiativeManager.tsx` (NEW)

**Features**:
- Initiative roll interface
- Manual initiative assignment
- Initiative order display
- Turn advancement controls

### 3.5 Live Interaction Creation
**File**: `src/components/live-interactions/LiveInteractionCreationForm.tsx` (NEW)

**Features**:
- Participant selection (PCs, NPCs, Monsters)
- Location/quest linking
- Reward item selection
- Interaction type configuration

## Phase 4: Real-time Integration

### 4.1 Convex Subscriptions
**Files**: `convex/interactions.ts`, `convex/playerActions.ts`

**Real-time Updates**:
- Active interaction status changes
- Initiative order updates
- New player action submissions
- DM action resolutions
- Turn advancements

### 4.2 Live Notification System
**File**: `src/hooks/useLiveInteractionNotifications.ts` (NEW)

**Features**:
- Turn notifications for players
- Action submission confirmations
- DM review notifications
- Interaction state change alerts

## Phase 5: UI/UX Implementation

### 5.1 Campaign Integration
**File**: `src/components/campaigns/CampaignDetail.tsx`

**Updates**:
- Add "Start Live Interaction" button
- Display active interaction status
- Link to live interaction dashboard

### 5.2 Navigation Updates
**File**: `src/components/Navigation.tsx`

**Updates**:
- Add "Live Interactions" menu item
- Show active interaction indicator
- Quick access to current interaction

### 5.3 Routing Updates
**File**: `src/App.tsx`

**New Routes**:
- `/campaigns/:id/live-interaction` - Live interaction dashboard
- `/campaigns/:id/live-interaction/create` - Create new live interaction
- `/live-interactions/:id` - Individual live interaction view

## Phase 6: Advanced Features

### 6.1 Dice Rolling Integration
**File**: `src/components/live-interactions/DiceRoller.tsx` (NEW)

**Features**:
- Standard D&D dice (d4, d6, d8, d10, d12, d20, d100)
- Initiative roll automation
- Combat dice integration
- Custom dice expressions

### 6.2 Combat State Management
**File**: `src/components/live-interactions/CombatStateManager.tsx` (NEW)

**Features**:
- Hit point tracking
- Status effect management
- Spell slot tracking
- Equipment usage

### 6.3 Interaction Templates
**File**: `src/components/live-interactions/InteractionTemplates.tsx` (NEW)

**Features**:
- Pre-configured interaction types
- Quick setup for common scenarios
- Template library management

## Phase 7: Testing & Validation

### 7.1 Unit Tests
**Files**: Various test files

**Coverage**:
- Schema validation
- API function testing
- Component rendering
- User interaction flows

### 7.2 Integration Tests
**Files**: Various test files

**Coverage**:
- End-to-end interaction flows
- Real-time synchronization
- Multi-user scenarios
- Error handling

### 7.3 User Acceptance Testing
**Scenarios**:
- DM creates and manages live interaction
- Players submit actions on their turns
- Initiative system functionality
- Reward distribution
- Error recovery

## Implementation Timeline

### part 1: Database & Backend
- Update schema definitions
- Implement core API functions
- Set up real-time subscriptions

### part 2: Core UI Components
- Live interaction dashboard
- Player action interface
- DM review panel
- Initiative management

### part 3: Integration & Polish
- Campaign integration
- Navigation updates
- Real-time notifications
- UI/UX refinements

### part 4: Advanced Features
- Dice rolling integration
- Combat state management
- Interaction templates
- Performance optimization

### part 5: Testing & Deployment
- Comprehensive testing
- Bug fixes
- Documentation
- Production deployment

## Technical Considerations

### Performance
- Optimize real-time subscriptions
- Implement efficient state management
- Use React.memo for expensive components
- Lazy load non-critical features

### Security
- Validate all user inputs
- Implement proper authorization checks
- Secure real-time connections
- Audit trail for all actions

### Scalability
- Design for multiple concurrent interactions
- Efficient database queries
- Optimistic UI updates
- Graceful error handling

### Accessibility
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support
- Mobile responsiveness

## Success Metrics

### Functional Requirements
- [ ] DM can initiate live interactions
- [ ] Initiative system works correctly
- [ ] Players can submit actions on their turns
- [ ] DM can review and resolve actions
- [ ] Turn order advances properly
- [ ] Rewards are distributed correctly

### Performance Requirements
- [ ] Real-time updates within 500ms
- [ ] Support for 10+ concurrent users
- [ ] Mobile-friendly interface
- [ ] 99.9% uptime during sessions

### User Experience Requirements
- [ ] Intuitive interface for DMs and players
- [ ] Clear turn indicators
- [ ] Smooth action submission flow
- [ ] Comprehensive error handling

## Risk Mitigation

### Technical Risks
- **Real-time synchronization issues**: Implement robust conflict resolution
- **Performance degradation**: Monitor and optimize database queries
- **Browser compatibility**: Test across major browsers

### User Experience Risks
- **Complex interface**: Provide clear onboarding and help documentation
- **Learning curve**: Create tutorial mode for new users
- **Mobile usability**: Extensive mobile testing and optimization

### Business Risks
- **Feature scope creep**: Maintain focus on core functionality
- **Timeline delays**: Build in buffer time for unexpected issues
- **User adoption**: Gather feedback early and iterate

## Conclusion

This development plan provides a comprehensive roadmap for implementing the live interaction system. The phased approach ensures that core functionality is delivered first, followed by advanced features and polish. Regular testing and user feedback will guide the development process to ensure the final product meets user needs and expectations.

The system will transform the DND Manager from a static campaign management tool into a dynamic, real-time platform that enhances the actual D&D gaming experience. 