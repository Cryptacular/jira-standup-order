import type StateV2 from "src/models/StateV2";
import type { StorageService } from "./storage";

export const databaseService: StorageService<StateV2> = {
  get: async (id): Promise<StateV2 | null> => {
    const response = await fetch(
      `https://dokkqfbdmbsbnsataxti.supabase.co/functions/v1/project-state/${id}`,
      {
        mode: "cors",
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      return null;
    }

    const body = await response.json();

    if (!body) {
      return null;
    }

    return body.state as StateV2;
  },

  set: async (id, state): Promise<void> => {
    const response = await fetch(
      `https://dokkqfbdmbsbnsataxti.supabase.co/functions/v1/project-state/${id}`,
      {
        mode: "cors",
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(state),
      }
    );

    if (!response.ok) {
      throw new Error(`Could not update state on server`);
    }
  },
};
