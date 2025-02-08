import { describe, expect, it } from "vitest";
import { AddCommand } from "../add-command";
import { TestState } from "../test-state";

describe("AddCommand", () => {
  describe("apply", () => {
    it("Adds a value to the test state.", () => {
      const state = new TestState(6);

      const command = new AddCommand(2);

      const actual = command.apply(state);
      const expected = new TestState(8);

      expect(actual.equals(expected)).toBe(true);
    });
  });

  describe("Memento", () => {
    it("Gets and restores from a snapshot.", () => {
      const state = new TestState(6);

      const command = new AddCommand(2);

      const snapshot = command.getSnapshot();
      const restored = AddCommand.makeFromSnapshot(snapshot);

      const actual = restored.apply(state);
      const expected = new TestState(8);

      expect(actual.equals(expected)).toBe(true);
    });
  });
});
