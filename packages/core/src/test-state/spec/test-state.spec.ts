import { describe, it, expect } from "vitest";
import { TestState } from "../test-state.js";

describe("TestState", () => {
  describe("equals", () => {
    it("Returns true for equal.", () => {
      const s1 = new TestState(5);
      const s2 = new TestState(5);

      expect(s1.equals(s2)).toBe(true);
    });

    it("Returns false for different values.", () => {
      const s1 = new TestState(5);
      const s2 = new TestState(4);

      expect(s1.equals(s2)).toBe(false);
    });

    it("Returns false for different types.", () => {
      const s = new TestState(5);

      expect(s.equals(5)).toBe(false);
    });
  });

  describe("Memento", () => {
    it("Gets and restores a snapshot.", () => {
      const s = new TestState(5);

      const snapshot = s.getSnapshot();

      expect(TestState.makeFromSnapshot(snapshot).equals(s)).toBe(true);
    });
  });
});
