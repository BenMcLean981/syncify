import { describe, expect, it } from 'vitest';
import { DivideCommand } from '../divide-command';
import { TestState } from '../test-state';

describe('DivideCommand', () => {
  describe('apply', () => {
    it('Divides the test state by a value.', () => {
      const state = new TestState(6);

      const command = new DivideCommand(2);

      const actual = command.apply(state);
      const expected = new TestState(3);

      expect(actual.equals(expected)).toBe(true);
    });
  });

  describe('Memento', () => {
    it('Gets and restores from a snapshot.', () => {
      const state = new TestState(6);

      const command = new DivideCommand(2);

      const snapshot = command.getSnapshot();
      const restored = DivideCommand.makeFromSnapshot(snapshot);

      const actual = restored.apply(state);
      const expected = new TestState(3);

      expect(actual.equals(expected)).toBe(true);
    });
  });
});
