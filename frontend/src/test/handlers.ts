import { http, HttpResponse } from "msw";
import { apiUrl, calendar } from "./api.ts";

/**
 * Happy-path defaults for every endpoint the app calls. A test overrides what it
 * cares about with `server.use(...)`; add a default here when a new endpoint ships.
 */
export const handlers = [
  http.get(apiUrl("/api/calendar"), () => HttpResponse.json(calendar())),
  http.get(apiUrl("/api/event-types"), () => HttpResponse.json([])),
];
