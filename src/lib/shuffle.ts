import { sample } from "underscore";

export const shuffleV1 = <T>(array: T[]): T[] => {
  const out = [...array];

  let currentIndex = out.length,
    randomIndex: number;

  // While there remain elements to shuffle.
  while (currentIndex != 0) {
    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [out[currentIndex], out[randomIndex]] = [
      out[randomIndex],
      out[currentIndex],
    ];
  }

  return out;
};

export const shuffleV2 = <T>(input: T[]): T[] => {
  return sample(input, Infinity);
};
