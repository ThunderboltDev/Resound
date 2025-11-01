/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as account from "../account.js";
import type * as conversation from "../conversation.js";
import type * as http from "../http.js";
import type * as organization from "../organization.js";
import type * as private_adapter from "../private/adapter.js";
import type * as session from "../session.js";
import type * as user from "../user.js";
import type * as widgetSession from "../widgetSession.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  account: typeof account;
  conversation: typeof conversation;
  http: typeof http;
  organization: typeof organization;
  "private/adapter": typeof private_adapter;
  session: typeof session;
  user: typeof user;
  widgetSession: typeof widgetSession;
}>;
declare const fullApiWithMounts: typeof fullApi;

export declare const api: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "internal">
>;

export declare const components: {};
