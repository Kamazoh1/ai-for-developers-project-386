// PROTOTYPE (throwaway): tiny in-memory store so a created event type shows up on /book too.
import { useSyncExternalStore } from "react";
import { type EventType, initialEventTypes } from "./data.ts";

let eventTypes: EventType[] = initialEventTypes;
const listeners = new Set<() => void>();

export function addEventType(type: EventType) {
  eventTypes = [...eventTypes, type];
  listeners.forEach((l) => l());
}

export function useEventTypes(): EventType[] {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => eventTypes,
  );
}
