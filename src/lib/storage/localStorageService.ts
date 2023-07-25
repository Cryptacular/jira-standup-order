import type { StorageService } from "./storage";

const localStorageKey = "jiraStandupOrder";

export const getLocalStorageService = <T>(): StorageService<T> => ({
  get: async (id): Promise<T | null> =>
    JSON.parse(localStorage.getItem(`${localStorageKey}-${id}`)) || null,

  set: async (id, state): Promise<void> => {
    localStorage.setItem(`${localStorageKey}-${id}`, JSON.stringify(state));
  },
});
