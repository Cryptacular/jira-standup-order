import { describe, expect, it } from "vitest";
import { isToday } from "./isToday";

describe(isToday.name, () => {
  it("returns true if date is same as today and passed as ISO string", () => {
    const date = new Date();

    const actual = isToday(date.toISOString());

    expect(actual).toBe(true);
  });

  it("returns true if date is same as today and passed as UTC string", () => {
    const date = new Date();

    const actual = isToday(date.toUTCString());

    expect(actual).toBe(true);
  });

  it("returns false if input is not a date string", () => {
    const actual = isToday("not a date");

    expect(actual).toBe(false);
  });

  it("returns false if date is null", () => {
    const actual = isToday(null);

    expect(actual).toBe(false);
  });

  it("returns true if date is same day but different time", () => {
    const date = new Date();
    date.setHours(0);
    date.setMinutes(0);
    date.setSeconds(0);

    const actual = isToday(date.toISOString());

    expect(actual).toBe(true);
  });
});
