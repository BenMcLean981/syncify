import { describe, it, expect } from "vitest";
import { add } from "../index.js";

describe("add", () => {
  it("Adds two numbers.", () => {
    expect(add(1, 2)).toBe(3);
  });
});
