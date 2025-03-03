import { type Command } from '../command'
import { type Snapshot } from '../memento'
import { TestState } from './test-state'

export class SubtractCommand implements Command<TestState> {
  private readonly _value: number

  public constructor(value: number) {
    this._value = value
  }

  public static makeFromSnapshot(
    snapshot: SubtractCommandSnapshot
  ): SubtractCommand {
    return new SubtractCommand(snapshot.value)
  }

  public apply(state: TestState): TestState {
    return new TestState(state.value - this._value)
  }

  public getSnapshot(): SubtractCommandSnapshot {
    return {
      type: 'Subtract',
      value: this._value,
    }
  }
}

export interface SubtractCommandSnapshot extends Snapshot {
  type: 'Subtract'

  value: number
}

export function isSubtractCommandSnapshot(
  snapshot: Snapshot
): snapshot is SubtractCommandSnapshot {
  return 'type' in snapshot && snapshot.type === 'Subtract'
}
