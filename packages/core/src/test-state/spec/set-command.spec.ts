import { describe, expect, it } from "vitest";
import { SetCommand } from "../set-command.js";
import { TestState } from "../test-state.js";

describe("SetCommand", () => {
  describe("apply", () => {
    it("Sets the test state to a value.", () => {
      const command = new SetCommand(2);

      const actual = command.apply();
      const expected = new TestState(2);

      expect(actual.equals(expected)).toBe(true);
    });
  });

  describe("Memento", () => {
    it("Gets and restores from a snapshot.", () => {
      const command = new SetCommand(2);

      const snapshot = command.getSnapshot();
      const restored = SetCommand.makeFromSnapshot(snapshot);

      const actual = restored.apply();
      const expected = new TestState(2);

      expect(actual.equals(expected)).toBe(true);
    });
  });
});
