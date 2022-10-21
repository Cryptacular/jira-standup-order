const localStorageKey = "jiraStandupOrder";

export function getState() {
  const savedState = localStorage.getItem(localStorageKey);

  return savedState
    ? JSON.parse(savedState)
    : {
        attendees: [],
        shuffled: [],
        lastShuffled: null,
        isEditing: true,
      };
}

export function setState(state) {
  localStorage.setItem(localStorageKey, JSON.stringify(state));
}
