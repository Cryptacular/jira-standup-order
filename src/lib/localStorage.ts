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
  const savedState = JSON.parse(localStorage.getItem(localStorageKey)) as State;
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
