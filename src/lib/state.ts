import { v4 } from "uuid";

export const localStorageKey = "jiraStandupOrder";

export interface Attendee {
  id: Id;
  name: string;
  isSkipped: boolean;
}

export interface Id extends String {}

export interface State {
  attendees: Attendee[];
  shuffled: Id[];
  currentAttendee: number | null;
  lastShuffled: string | null;
}

/**
 *
 * @returns {State} state
 */
export function getState(): State {
  const defaultState: State = {
    attendees: [],
    shuffled: [],
    currentAttendee: null,
    lastShuffled: null,
  };

  const savedState: State = {
    ...defaultState,
    ...(JSON.parse(localStorage.getItem(localStorageKey)) || {}),
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

  if (typeof savedState.currentAttendee !== "number") {
    savedState.currentAttendee = null;
  }

  savedState.attendees =
    savedState.attendees?.map((a) => ({ ...a, name: a.name.trim() })) || [];

  const initialState: State = {
    attendees: [],
    shuffled: [],
    currentAttendee: null,
    lastShuffled: null,
  };

  return savedState ? { ...initialState, ...savedState } : initialState;
}

/**
 * @param {State} state
 */
export function setState(state: State): void {
  localStorage.setItem(localStorageKey, JSON.stringify(state));
}
