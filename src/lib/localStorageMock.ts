export const createLocalStorageMock = (): Storage => {
  const items: Map<string, string> = new Map<string, string>();

  return {
    length: items.size,
    clear: () => items.clear(),
    getItem: (key: string): string => {
      if (items.has(key)) {
        return items.get(key);
      }
      return null;
    },
    key: (index: number): string => {
      throw new Error("Function not implemented.");
    },
    removeItem: (key: string): void => {
      items.delete(key);
    },
    setItem: (key: string, value: string): void => {
      items.set(key, value);
    },
  };
};
