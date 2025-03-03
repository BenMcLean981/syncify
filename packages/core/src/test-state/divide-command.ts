import { type Command } from '../command'
import { type Snapshot } from '../memento'
import { TestState } from './test-state'

export class DivideCommand implements Command<TestState> {
  private readonly _value: number

  public constructor(value: number) {
    this._value = value
  }

  public static makeFromSnapshot(
    snapshot: DivideCommandSnapshot
  ): DivideCommand {
    return new DivideCommand(snapshot.value)
  }

  public apply(state: TestState): TestState {
    return new TestState(state.value / this._value)
  }

  public getSnapshot(): DivideCommandSnapshot {
    return {
      type: 'Divide',
      value: this._value,
    }
  }
}

export interface DivideCommandSnapshot extends Snapshot {
  type: 'Divide'

  value: number
}

export function isDivideCommandSnapshot(
  snapshot: Snapshot
): snapshot is DivideCommandSnapshot {
  return 'type' in snapshot && snapshot.type === 'Divide'
}
