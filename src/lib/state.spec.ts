import { beforeEach, describe, expect, it, vi } from "vitest";
import { State, getState, localStorageKey, setState } from "./state";
import { createLocalStorageMock } from "./localStorageMock";

describe("state", () => {
  beforeEach(() => {
    vi.stubGlobal("localStorage", createLocalStorageMock());
  });

  describe("getState()", () => {
    it("returns default state if none exists in local storage", () => {
      const expected: State = {
        attendees: [],
        shuffled: [],
        skipped: [],
        currentAttendee: null,
        lastShuffled: null,
      };

      const actual = getState();

      expect(actual).toStrictEqual(expected);
    });

    it("returns state from local storage and adds missing properties required in State interface", () => {
      localStorage.setItem(
        localStorageKey,
        JSON.stringify({ attendees: ["Bert", "Ernie"] } as Partial<State>)
      );

      const expected: State = {
        attendees: ["Bert", "Ernie"],
        shuffled: [],
        skipped: [],
        currentAttendee: null,
        lastShuffled: null,
      };

      const actual = getState();

      expect(actual).toStrictEqual(expected);
    });
  });

  describe("setState()", () => {
    it("saves state to local storage", () => {
      const state: State = {
        attendees: ["Big Bird", "Elmo", "Grover"],
        shuffled: ["Grover", "Big Bird", "Elmo"],
        currentAttendee: "Elmo",
        skipped: ["Grover"],
        lastShuffled: new Date(2023, 5, 16, 12, 10, 0).toISOString(),
      };

      setState(state);
      const actual = localStorage.getItem(localStorageKey);

      expect(actual).toStrictEqual(JSON.stringify(state));
    });
  });
});
