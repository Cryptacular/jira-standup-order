const localStorageKey = "jiraStandupOrder";

interface State {
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
  const savedState = localStorage.getItem(localStorageKey);

  const initialState: State = {
    attendees: [],
    shuffled: [],
    skipped: [],
    currentAttendee: null,
    lastShuffled: null,
  };

  return savedState
    ? { ...initialState, ...JSON.parse(savedState) }
    : initialState;
}

/**
 * @param {State} state
 */
export function setState(state: State): void {
  localStorage.setItem(localStorageKey, JSON.stringify(state));
}
