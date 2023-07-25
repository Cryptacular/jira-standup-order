import { v4 } from "uuid";
import { getLocalStorageService } from "./storage/localStorageService";
import { databaseService } from "./storage/databaseService";
import type Attendee from "src/models/Attendee";
import type Id from "src/models/Id";
import type StateV2 from "src/models/StateV2";

export const defaultState: StateV2 = {
  version: "2",
  attendees: [],
  shuffled: [],
  lastShuffled: null,
};

/**
 *
 * @returns {StateV2} state
 */
export async function getState(
  id: Id,
  shouldSyncWithServer: boolean
): Promise<StateV2> {
  const storageService = shouldSyncWithServer
    ? databaseService
    : getLocalStorageService<StateV2>();

  const savedState: StateV2 = {
    ...defaultState,
    ...((await storageService.get(id)) || {}),
  };

  if (
    savedState.attendees.length > 0 &&
    typeof savedState.attendees[0] === "string"
  ) {
    savedState.attendees = (savedState.attendees as unknown as string[]).map(
      (x): Attendee => ({ id: v4(), name: x, isSkipped: false })
    );
    savedState.shuffled = savedState.attendees.map((a) => a.id);
  }

  savedState.shuffled = savedState.shuffled.filter(
    (s) => !!savedState.attendees.find((a) => a.id === s)
  );

  if (savedState.shuffled.length !== savedState.attendees.length) {
    savedState.shuffled = savedState.attendees.map((a) => a.id);
  }

  if (savedState["skipped"]) {
    delete savedState["skipped"];
  }

  if (savedState["currentAttendee"]) {
    delete savedState["currentAttendee"];
  }

  savedState.attendees =
    savedState.attendees?.map((a) => ({ ...a, name: a.name.trim() })) || [];

  return savedState;
}

/**
 * @param {Id} id
 * @param {StateV2} state
 */
export async function setState(
  id: Id,
  state: StateV2,
  shouldSyncWithServer?: boolean
): Promise<void> {
  const storageService = shouldSyncWithServer
    ? databaseService
    : getLocalStorageService<StateV2>();
  await storageService.set(id, state);
}
