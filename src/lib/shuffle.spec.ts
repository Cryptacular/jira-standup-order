import { describe, expect, it } from "vitest";
import { shuffle } from "./shuffle";

describe(shuffle.name, () => {
  it("returns empty array if empty array is passed in", () => {
    const actual = shuffle([]);

    expect(actual).toHaveLength(0);
  });

  it("returns shuffled array (tested for 1000 cycles)", () => {
    const input = [1, 2, 3, 4, 5];

    const multipleOutputs: number[][] = [];

    for (let i = 0; i < 1000; i++) {
      multipleOutputs.push(shuffle(input));
    }

    const areAllOutputsSameAsInput = multipleOutputs.every(
      (x) => JSON.stringify(x) === JSON.stringify(input)
    );

    expect(areAllOutputsSameAsInput).toBe(false);
  });

  it("doesn't alter input array when shuffling", () => {
    const input = [
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
    ];

    shuffle(input);

    expect(input).toStrictEqual([
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
    ]);
  });
});
