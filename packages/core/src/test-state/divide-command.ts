import { TestState } from './test-state';
import { type Command } from '../command';
import { type Snapshot } from '../memento';

export class DivideCommand implements Command<TestState> {
  private readonly _value: number;

  public constructor(value: number) {
    this._value = value;
  }

  public static makeFromSnapshot(
    snapshot: DivideCommandSnapshot
  ): DivideCommand {
    return new DivideCommand(snapshot.value);
  }

  public apply(state: TestState): TestState {
    return new TestState(state.value / this._value);
  }

  public getSnapshot(): DivideCommandSnapshot {
    return {
      type: 'Divide-Command',
      value: this._value,
    };
  }
}

interface DivideCommandSnapshot extends Snapshot {
  type: 'Divide-Command';

  value: number;
}
