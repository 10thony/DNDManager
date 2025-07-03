# Monster Integration for Interactions

This update adds full monster support to the interactions system, allowing you to link monsters to interactions and perform CRUD operations on them.

## Changes Made

### 1. Schema Updates
- **File**: `convex/schema.ts`
- **Change**: Added `monsterIds: v.optional(v.array(v.id("monsters")))` to the interactions table

### 2. Backend Functions
- **File**: `convex/interactions.ts`
- **Changes**:
  - Added `monsterIds` to `createInteraction` mutation
  - Added `monsterIds` to `updateInteraction` mutation
  - Added `addMonstersToInteraction` mutation for linking monsters

### 3. Frontend Components

#### InteractionDetail Component
- **File**: `src/components/InteractionDetail.tsx`
- **Changes**:
  - Added monster-related imports and state
  - Added monster queries and filtering
  - Added monster section to UI with link/unlink functionality
  - Added monster creation modal integration
  - Updated entity selection to support monsters

#### EntitySelectionModal Component
- **File**: `src/components/modals/EntitySelectionModal.tsx`
- **Changes**:
  - Added "monsters" to entityType union
  - Added monsters query
  - Added monster display logic in getEntityDisplayName and getEntityDescription

#### InteractionCreationForm Component
- **File**: `src/components/InteractionCreationForm.tsx`
- **Changes**:
  - Added monsters query
  - Added monsterIds to form state
  - Added handleMonsterToggle function
  - Added monsters section to participants form

#### MonsterCreationModal Component
- **File**: `src/components/modals/MonsterCreationModal.tsx` (NEW)
- **Features**:
  - Complete monster creation form
  - All monster fields supported (name, size, type, CR, abilities, etc.)
  - Responsive design
  - Form validation

#### MonsterCreationModal CSS
- **File**: `src/components/modals/MonsterCreationModal.css` (NEW)
- **Features**:
  - Styled form sections
  - Responsive grid layouts
  - Dark mode support

### 4. Database Migration
- **File**: `convex/init.ts`
- **Function**: `migrateInteractionsAddMonsterIds`
- **Purpose**: Adds monsterIds field to existing interactions

## How to Use

### 1. Deploy Schema Changes
First, deploy your schema changes to Convex:
```bash
npx convex deploy
```

### 2. Run Migration
Run the migration to add monsterIds to existing interactions:
```javascript
import { useMutation } from "convex/react";
import { api } from "./convex/_generated/api";

const migrateInteractionsAddMonsterIds = useMutation(api.init.migrateInteractionsAddMonsterIds);

const runMigration = async () => {
  try {
    const result = await migrateInteractionsAddMonsterIds({});
    console.log(`Migration completed. ${result.migratedCount} interactions updated.`);
  } catch (error) {
    console.error("Migration failed:", error);
  }
};
```

### 3. Using Monster Features

#### Linking Existing Monsters
1. Navigate to an interaction detail page
2. Click "🐉 Link Monster" in the quick actions bar
3. Select from existing monsters in the modal
4. The monster will be linked to the interaction

#### Creating New Monsters
1. Navigate to an interaction detail page
2. Click "🐉 Create Monster" in the quick actions bar
3. Fill out the monster creation form
4. The monster will be created and automatically linked to the interaction

#### Managing Monster Links
- View linked monsters in the "🐉 Monsters" section
- Click "Unlink" to remove a monster from the interaction
- Monsters remain in the database but are no longer linked to the interaction

#### Creating Interactions with Monsters
1. Use the interaction creation form
2. In the "Participants" section, check the monsters you want to include
3. The interaction will be created with the selected monsters linked

## Monster Data Structure

Monsters include the following fields:
- **Basic Info**: name, size, type, alignment, source, page
- **Combat Stats**: armor class, hit points, hit dice, challenge rating, XP
- **Abilities**: strength, dexterity, constitution, intelligence, wisdom, charisma
- **Movement**: walk, swim, fly, burrow, climb speeds
- **Senses**: darkvision, blindsight, tremorsense, truesight, passive perception
- **Languages**: spoken languages
- **Actions**: traits, actions, reactions, legendary actions, lair actions
- **Environment**: where the monster can be found

## Error Handling

The system includes comprehensive error handling:
- Form validation for required fields
- Database operation error handling
- User feedback for successful/failed operations
- Graceful fallbacks for missing data

## Future Enhancements

Potential improvements for the monster system:
1. Monster templates/presets
2. Bulk monster import/export
3. Monster encounter balancing tools
4. Monster stat tracking during interactions
5. Monster loot tables
6. Monster lair effects integration

## Troubleshooting

### Common Issues

1. **Migration fails**: Ensure schema is deployed before running migration
2. **Monsters not showing**: Check that monsters exist in the database
3. **Form validation errors**: Ensure all required fields are filled
4. **Type errors**: Make sure all imports are correct and types match

### Debug Steps

1. Check browser console for errors
2. Verify database queries are working
3. Confirm schema changes are deployed
4. Test with a fresh interaction creation

## Support

If you encounter issues with the monster integration:
1. Check the browser console for error messages
2. Verify all files are properly updated
3. Ensure the migration has been run
4. Test with a new interaction to isolate the issue 