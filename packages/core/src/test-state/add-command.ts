import { TestState } from './test-state.js';
import { type Command } from '../command/index.js';
import { type Snapshot } from '../memento/index.js';

export class AddCommand implements Command<TestState> {
  private readonly _value: number;

  public constructor(value: number) {
    this._value = value;
  }
  
  public static makeFromSnapshot(snapshot: AddCommandSnapshot): AddCommand {
    return new AddCommand(snapshot.value);
  }

  public apply(state: TestState): TestState {
    return new TestState(state.value + this._value);
  }

  public getSnapshot(): AddCommandSnapshot {
    return {
      type: 'Add-Command',
      value: this._value,
    };
  }
}

interface AddCommandSnapshot extends Snapshot {
  type: 'Add-Command';

  value: number;
}
