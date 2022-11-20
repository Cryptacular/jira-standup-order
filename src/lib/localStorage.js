const localStorageKey = "jiraStandupOrder";

export function getState() {
  const savedState = localStorage.getItem(localStorageKey);

  const initialState = {
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
 * @param {object} state
 */
export function setState(state) {
  localStorage.setItem(localStorageKey, JSON.stringify(state));
}
