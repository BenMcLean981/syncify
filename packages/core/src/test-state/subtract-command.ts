import { TestState } from './test-state';
import { type Command } from '../command';
import { type Snapshot } from '../memento';

export class SubtractCommand implements Command<TestState> {
  private readonly _value: number;

  public constructor(value: number) {
    this._value = value;
  }

  public static makeFromSnapshot(
    snapshot: SubtractCommandSnapshot
  ): SubtractCommand {
    return new SubtractCommand(snapshot.value);
  }

  public apply(state: TestState): TestState {
    return new TestState(state.value - this._value);
  }

  public getSnapshot(): SubtractCommandSnapshot {
    return {
      type: 'Subtract-Command',
      value: this._value,
    };
  }
}

interface SubtractCommandSnapshot extends Snapshot {
  type: 'Subtract-Command';

  value: number;
}
