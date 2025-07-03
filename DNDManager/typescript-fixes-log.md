# TypeScript Errors and Fixes Log

## Initial TypeScript Check Results
Running `npx tsc --noEmit` revealed 97 errors across 40 files.

## Current Status (After Recent Fixes)
Running `npx tsc --noEmit` now shows 37 errors across 15 files.

## Error Categories (as of latest check):

### 1. Unused Variables/Imports (TS6133)
- Many files have unused imports or variables (e.g., useQuery, api, useDarkMode, etc.)

### 2. Type Mismatches (TS2322, TS2322, TS2339, TS2345, TS2551, TS2554, TS2698)
- Type assignment issues (e.g., Id<"users"> | null not assignable to string)
- Property does not exist on type (e.g., getCampaigns, getNPCs, getAllFactions)
- Argument of type X is not assignable to parameter of type Y (e.g., missing required fields)
- Expected 2 arguments, but got 1 (useQuery calls)
- Spread types may only be created from object types

### 3. Import/Module Issues (TS2307)
- Cannot find module '../convex/_generated/api' or its corresponding type declarations

### 4. Null Safety Issues (TS2440, TS2322)
- Import declaration conflicts with local declaration
- Property 'cellSize' does not exist on type 'MapPreviewProps'

### 5. Implicit Any (TS7006)
- Parameters implicitly have 'any' type in map functions

## Fixes Applied:
- Fixed missing arguments in useQuery calls for maps and users
- Improved null safety in FactionDetail.tsx
- Added type guards for arrays with possible nulls

## Progress:
- [x] Start systematic fixes
- [x] Fix unused variables/imports in convex backend
- [x] Fix type mismatches in convex backend
- [x] Fix unused variables/imports in frontend
- [x] Fix type mismatches in frontend (campaign creation and subsections)
- [x] Fix null safety issue in FactionDetail.tsx
- [x] Fix useQuery arguments for maps and users
- [ ] Fix missing arguments (TS2554 errors) in all useQuery calls
- [ ] Fix type mismatches (TS2322, TS2339, TS2345, TS2551, TS2698)
- [ ] Fix import/module issues (TS2307)
- [ ] Fix implicit any (TS7006)
- [ ] Remove unused variables/imports (TS6133)
- [ ] Re-run TypeScript check
- [ ] Verify all errors are resolved

## Remaining Error Count: 37 errors across 15 files

### Notable Files with Errors (as of latest check):
- src/components/InteractionDetail.tsx
- src/components/LocationDetails.tsx
- src/components/modals/MonsterCreationModal.tsx
- src/components/modals/NPCCreationModal.tsx
- src/components/MonsterCreationForm.tsx
- src/components/MonsterForm.tsx
- src/components/MonsterList.tsx
- src/components/QuestCreationForm.tsx
- src/components/QuestDetail.tsx
- src/components/QuestForm.tsx
- src/components/QuestTaskCreationForm.tsx
- src/components/TimelineEventCreationForm.tsx
- src/components/TimelineEventDetail.tsx
- src/pages/page.tsx
- src/types/dndRules.ts

---

## Latest TypeScript Error Output (for traceability)

```
[See previous assistant message for full error output.]
``` 