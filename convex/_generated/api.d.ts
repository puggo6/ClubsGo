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
import type * as announcements from "../announcements.js";
import type * as cleanClubList from "../cleanClubList.js";
import type * as clubs from "../clubs.js";
import type * as events from "../events.js";
import type * as groupChats from "../groupChats.js";
import type * as http from "../http.js";
import type * as schools from "../schools.js";
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
  announcements: typeof announcements;
  cleanClubList: typeof cleanClubList;
  clubs: typeof clubs;
  events: typeof events;
  groupChats: typeof groupChats;
  http: typeof http;
  schools: typeof schools;
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
