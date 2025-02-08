import { describe, expect, it } from "vitest";
import { MultiplyCommand } from "../multiply-command";
import { TestState } from "../test-state";

describe("MultiplyCommand", () => {
  describe("apply", () => {
    it("Multiplies the test state by a value.", () => {
      const state = new TestState(6);

      const command = new MultiplyCommand(2);

      const actual = command.apply(state);
      const expected = new TestState(12);

      expect(actual.equals(expected)).toBe(true);
    });
  });

  describe("Memento", () => {
    it("Gets and restores from a snapshot.", () => {
      const state = new TestState(6);

      const command = new MultiplyCommand(2);

      const snapshot = command.getSnapshot();
      const restored = MultiplyCommand.makeFromSnapshot(snapshot);

      const actual = restored.apply(state);
      const expected = new TestState(12);

      expect(actual.equals(expected)).toBe(true);
    });
  });
});
