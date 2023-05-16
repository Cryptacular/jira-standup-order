import { describe, expect, it } from "vitest";
import { createLocalStorageMock } from "./localStorageMock";

describe(createLocalStorageMock.name, () => {
  it("returns object with the correct properties", () => {
    const actual = createLocalStorageMock();

    expect(actual.clear).toBeTypeOf("function");
    expect(actual.getItem).toBeTypeOf("function");
    expect(actual.key).toBeTypeOf("function");
    expect(actual.removeItem).toBeTypeOf("function");
    expect(actual.setItem).toBeTypeOf("function");
  });

  it("returns null when trying to get key that doesn't exist", () => {
    const localStorage = createLocalStorageMock();

    const actual = localStorage.getItem("doesntexist");

    expect(actual).toBeNull();
  });

  it("allows setting and getting items by key", () => {
    const localStorage = createLocalStorageMock();

    localStorage.setItem("testKey", "testValue");
    const actual = localStorage.getItem("testKey");

    expect(actual).toEqual("testValue");
  });

  it("allows removing items by key", () => {
    const localStorage = createLocalStorageMock();

    localStorage.setItem("testKey", "testValue");
    const itemBeforeDeleting = localStorage.getItem("testKey");

    localStorage.removeItem("testKey");
    const itemAfterDeleting = localStorage.getItem("testKey");

    expect(itemBeforeDeleting).toEqual("testValue");
    expect(itemAfterDeleting).toEqual(null);
  });
});
