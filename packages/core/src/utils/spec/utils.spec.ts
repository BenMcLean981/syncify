import { describe, it, expect } from "vitest";
import { isEven, isOdd } from "../utils";

describe("isOdd", () => {
  it("Returns false for zero.", () => {
    expect(isOdd(0)).toBe(false);
  });

  it("Returns false for negative even.", () => {
    expect(isOdd(-2)).toBe(false);
    expect(isOdd(-4)).toBe(false);
    expect(isOdd(-122)).toBe(false);
  });

  it("Returns false for positive even.", () => {
    expect(isOdd(2)).toBe(false);
    expect(isOdd(4)).toBe(false);
    expect(isOdd(122)).toBe(false);
  });

  it("Returns true for negative odd.", () => {
    expect(isOdd(-1)).toBe(true);
    expect(isOdd(-3)).toBe(true);
    expect(isOdd(-123)).toBe(true);
  });

  it("Returns true for positive odd.", () => {
    expect(isOdd(1)).toBe(true);
    expect(isOdd(3)).toBe(true);
    expect(isOdd(123)).toBe(true);
  });
});

describe("isEven", () => {
  it("Returns true for zero.", () => {
    expect(isEven(0)).toBe(true);
  });

  it("Returns true for negative even.", () => {
    expect(isEven(-2)).toBe(true);
    expect(isEven(-4)).toBe(true);
    expect(isEven(-122)).toBe(true);
  });

  it("Returns true for positive even.", () => {
    expect(isEven(2)).toBe(true);
    expect(isEven(4)).toBe(true);
    expect(isEven(122)).toBe(true);
  });

  it("Returns false for negative odd.", () => {
    expect(isEven(-1)).toBe(false);
    expect(isEven(-3)).toBe(false);
    expect(isEven(-123)).toBe(false);
  });

  it("Returns false for positive odd.", () => {
    expect(isEven(1)).toBe(false);
    expect(isEven(3)).toBe(false);
    expect(isEven(123)).toBe(false);
  });
});
