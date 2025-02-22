import { TestState } from './test-state';
import { type Command } from '../command';
import { type Snapshot } from '../memento';

export class SetCommand implements Command<TestState> {
  private readonly _value: number;

  public constructor(value: number) {
    this._value = value;
  }

  public static makeFromSnapshot(snapshot: SetCommandSnapshot): SetCommand {
    return new SetCommand(snapshot.value);
  }

  public apply(): TestState {
    return new TestState(this._value);
  }

  public getSnapshot(): SetCommandSnapshot {
    return {
      type: 'Set-Command',
      value: this._value,
    };
  }
}

interface SetCommandSnapshot extends Snapshot {
  type: 'Set-Command';

  value: number;
}
