import type { CalendarSettings, EventType } from "../api/types.gen.ts";

/** Base URL the app talks to in tests (see `test.env` in vite.config.ts). */
const API_URL = import.meta.env.VITE_API_URL;

/** Absolute URL of an API path, for msw handlers: `http.get(apiUrl("/api/calendar"), ...)`. */
export function apiUrl(path: string): string {
  return `${API_URL}${path}`;
}

/** Contract-shaped fixtures. Each takes overrides: `calendar({ owner: { name: "Анна" } })`. */
export function calendar(overrides: Partial<CalendarSettings> = {}): CalendarSettings {
  return {
    timezone: "Europe/Moscow",
    workingHours: { start: "09:00:00", end: "18:00:00" },
    slotStepMinutes: 30,
    bookingWindowDays: 14,
    owner: { name: "Алексей Иванов" },
    ...overrides,
  };
}

export function eventType(overrides: Partial<EventType> = {}): EventType {
  return {
    id: "intro-call",
    name: "Знакомство",
    description: "Короткий созвон",
    durationMinutes: 15,
    ...overrides,
  };
}
