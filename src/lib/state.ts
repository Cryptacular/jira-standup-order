export const localStorageKey = "jiraStandupOrder";

export interface State {
  attendees: string[];
  shuffled: string[];
  skipped: string[];
  currentAttendee: string | null;
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
    skipped: [],
    currentAttendee: null,
    lastShuffled: null,
  };

  const savedState: State = {
    ...defaultState,
    ...(JSON.parse(localStorage.getItem(localStorageKey)) || {}),
  };

  savedState.attendees = savedState.attendees?.filter((a) => !!a.trim()) || [];
  savedState.shuffled = savedState.shuffled?.filter((a) => !!a.trim()) || [];

  const initialState: State = {
    attendees: [],
    shuffled: [],
    skipped: [],
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
