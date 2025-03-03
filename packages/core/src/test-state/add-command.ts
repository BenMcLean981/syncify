import { type Command } from '../command'
import { type Snapshot } from '../memento'
import { TestState } from './test-state'

export class AddCommand implements Command<TestState> {
  private readonly _value: number

  public constructor(value: number) {
    this._value = value
  }

  public static makeFromSnapshot(snapshot: AddCommandSnapshot): AddCommand {
    return new AddCommand(snapshot.value)
  }

  public apply(state: TestState): TestState {
    return new TestState(state.value + this._value)
  }

  public getSnapshot(): AddCommandSnapshot {
    return {
      type: 'Add',
      value: this._value,
    }
  }
}

export interface AddCommandSnapshot extends Snapshot {
  type: 'Add'

  value: number
}

export function isAddCommandSnapshot(
  snapshot: Snapshot
): snapshot is AddCommandSnapshot {
  return 'type' in snapshot && snapshot.type === 'Add'
}
