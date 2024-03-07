import { describe, expect, it } from "vitest";
import { shuffleV1, shuffleV2 } from "./shuffle";
import { median, std } from "mathjs";

describe(shuffleV1.name, () => {
  it("returns empty array if empty array is passed in", () => {
    const actual = shuffleV1([]);

    expect(actual).toHaveLength(0);
  });

  it("returns shuffled array (tested for 1000 cycles)", () => {
    const input = [1, 2, 3, 4, 5];

    const multipleOutputs: number[][] = [];

    for (let i = 0; i < 1000; i++) {
      multipleOutputs.push(shuffleV1(input));
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

    shuffleV1(input);

    expect(input).toStrictEqual([
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
    ]);
  });
});

describe(shuffleV2.name, () => {
  it("returns empty array if empty array is passed in", () => {
    const actual = shuffleV2([]);

    expect(actual).toHaveLength(0);
  });

  it("returns shuffled array (tested for 1000 cycles)", () => {
    const input = [1, 2, 3, 4, 5];

    const multipleOutputs: number[][] = [];

    for (let i = 0; i < 1000; i++) {
      multipleOutputs.push(shuffleV2(input));
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

    shuffleV2(input);

    expect(input).toStrictEqual([
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
    ]);
  });

  it(`gives less biased random results compared to '${shuffleV1.name}'`, () => {
    const input = [
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
    ];

    const standardDeviationV1 = calcAverageStandardDeviation(input, shuffleV1);
    const standardDeviationV2 = calcAverageStandardDeviation(input, shuffleV2);

    expect(standardDeviationV2).toBeLessThanOrEqual(standardDeviationV1);
  });
});

const calcAverageStandardDeviation = (
  input: number[],
  shuffleFunction: typeof shuffleV1
): number => {
  const allOutputs: number[][] = [];

  for (let i = 0; i < 10000; i++) {
    allOutputs.push(shuffleFunction(input));
  }

  const standardDeviationsOfAllOutputs = allOutputs.map((arr) => std(arr));
  const averageStandardDeviation = median(standardDeviationsOfAllOutputs);

  return averageStandardDeviation as number;
};
