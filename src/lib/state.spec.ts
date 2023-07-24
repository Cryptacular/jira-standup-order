import { beforeEach, describe, expect, it, vi } from "vitest";
import { getState, setState } from "./state";
import { createLocalStorageMock } from "./localStorageMock";
import type StateV2 from "src/models/StateV2";

const localStorageKey = "jiraStandupOrder";

describe("state", () => {
  beforeEach(() => {
    vi.stubGlobal("localStorage", createLocalStorageMock());
  });

  describe("getState()", () => {
    it("returns default state if none exists in local storage", async () => {
      const expected: StateV2 = {
        version: 2,
        attendees: [],
        shuffled: [],
        currentAttendee: null,
        lastShuffled: null,
      };

      const actual = await getState("test", false);

      expect(actual).toStrictEqual(expected);
    });

    it("returns state from local storage and adds missing properties required in State interface", async () => {
      const id = "abc";

      localStorage.setItem(
        `${localStorageKey}-${id}`,
        JSON.stringify({
          attendees: [
            { id: "1", name: "Bert", isSkipped: false },
            { id: "2", name: "Ernie", isSkipped: true },
          ],
        } as Partial<StateV2>)
      );

      const expected: StateV2 = {
        version: 2,
        attendees: [
          { id: "1", name: "Bert", isSkipped: false },
          { id: "2", name: "Ernie", isSkipped: true },
        ],
        shuffled: ["1", "2"],
        currentAttendee: null,
        lastShuffled: null,
      };

      const actual = await getState(id, false);

      expect(actual).toStrictEqual(expected);
    });
  });

  describe("setState()", () => {
    it("saves state to local storage", async () => {
      const id = "123";
      const state: StateV2 = {
        version: 2,
        attendees: [
          { id: "1", name: "Big Bird", isSkipped: false },
          { id: "2", name: "Elmo", isSkipped: false },
          { id: "3", name: "Grover", isSkipped: true },
        ],
        shuffled: ["Grover", "Big Bird", "Elmo"],
        currentAttendee: 1,
        lastShuffled: new Date(2023, 5, 16, 12, 10, 0).toISOString(),
      };

      await setState(id, state);
      const actual = localStorage.getItem(`${localStorageKey}-${id}`);

      expect(actual).toStrictEqual(JSON.stringify(state));
    });
  });
});
