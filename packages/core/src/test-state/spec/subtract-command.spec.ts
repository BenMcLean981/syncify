import { describe, expect, it } from "vitest";
import { SubtractCommand } from "../subtract-command";
import { TestState } from "../test-state";

describe("SubtractCommand", () => {
  describe("apply", () => {
    it("Subtracts a value from the test state.", () => {
      const state = new TestState(6);

      const command = new SubtractCommand(2);

      const actual = command.apply(state);
      const expected = new TestState(4);

      expect(actual.equals(expected)).toBe(true);
    });
  });

  describe("Memento", () => {
    it("Gets and restores from a snapshot.", () => {
      const state = new TestState(6);

      const command = new SubtractCommand(2);

      const snapshot = command.getSnapshot();
      const restored = SubtractCommand.makeFromSnapshot(snapshot);

      const actual = restored.apply(state);
      const expected = new TestState(4);

      expect(actual.equals(expected)).toBe(true);
    });
  });
});
