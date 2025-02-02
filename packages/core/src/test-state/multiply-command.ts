import { TestState } from './test-state.js';
import { type Command } from '../command/index.js';
import { type Snapshot } from '../memento/index.js';

export class MultiplyCommand implements Command<TestState> {
  private readonly _value: number;

  public constructor(value: number) {
    this._value = value;
  }

  public static makeFromSnapshot(
    snapshot: MultiplyCommandSnapshot
  ): MultiplyCommand {
    return new MultiplyCommand(snapshot.value);
  }

  public apply(state: TestState): TestState {
    return new TestState(state.value * this._value);
  }

  public getSnapshot(): MultiplyCommandSnapshot {
    return {
      type: 'Multiply-Command',
      value: this._value,
    };
  }
}

interface MultiplyCommandSnapshot extends Snapshot {
  type: 'Multiply-Command';

  value: number;
}
