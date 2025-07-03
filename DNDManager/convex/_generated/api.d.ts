/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as actions from "../actions.js";
import type * as campaigns from "../campaigns.js";
import type * as characters from "../characters.js";
import type * as factions from "../factions.js";
import type * as init from "../init.js";
import type * as interactions from "../interactions.js";
import type * as items from "../items.js";
import type * as locations from "../locations.js";
import type * as maps from "../maps.js";
import type * as monsters from "../monsters.js";
import type * as npcs from "../npcs.js";
import type * as questTasks from "../questTasks.js";
import type * as quests from "../quests.js";
import type * as sessions from "../sessions.js";
import type * as timelineEvents from "../timelineEvents.js";
import type * as users from "../users.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  actions: typeof actions;
  campaigns: typeof campaigns;
  characters: typeof characters;
  factions: typeof factions;
  init: typeof init;
  interactions: typeof interactions;
  items: typeof items;
  locations: typeof locations;
  maps: typeof maps;
  monsters: typeof monsters;
  npcs: typeof npcs;
  questTasks: typeof questTasks;
  quests: typeof quests;
  sessions: typeof sessions;
  timelineEvents: typeof timelineEvents;
  users: typeof users;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
