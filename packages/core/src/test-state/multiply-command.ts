import { type Command } from '../command'
import { type Snapshot } from '../memento'
import { TestState } from './test-state'

export class MultiplyCommand implements Command<TestState> {
  private readonly _value: number

  public constructor(value: number) {
    this._value = value
  }

  public static makeFromSnapshot(
    snapshot: MultiplyCommandSnapshot
  ): MultiplyCommand {
    return new MultiplyCommand(snapshot.value)
  }

  public apply(state: TestState): TestState {
    return new TestState(state.value * this._value)
  }

  public getSnapshot(): MultiplyCommandSnapshot {
    return {
      type: 'Multiply',
      value: this._value,
    }
  }
}

export interface MultiplyCommandSnapshot extends Snapshot {
  type: 'Multiply'

  value: number
}

export function isMultiplyCommandSnapshot(
  snapshot: Snapshot
): snapshot is MultiplyCommandSnapshot {
  return 'type' in snapshot && snapshot.type === 'Multiply'
}
