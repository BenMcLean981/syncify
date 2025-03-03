import { Command } from '../command'
import { Snapshot } from '../memento'
import { AddCommand, isAddCommandSnapshot } from './add-command'
import { DivideCommand, isDivideCommandSnapshot } from './divide-command'
import { isMultiplyCommandSnapshot, MultiplyCommand } from './multiply-command'
import { isSetCommandSnapshot, SetCommand } from './set-command'
import { isSubtractCommandSnapshot, SubtractCommand } from './subtract-command'
import { isTestStateSnapshot, TestState } from './test-state'

export function restoreTestCommand(snapshot: Snapshot): Command<TestState> {
  if (isAddCommandSnapshot(snapshot)) {
    return AddCommand.makeFromSnapshot(snapshot)
  } else if (isDivideCommandSnapshot(snapshot)) {
    return DivideCommand.makeFromSnapshot(snapshot)
  } else if (isMultiplyCommandSnapshot(snapshot)) {
    return MultiplyCommand.makeFromSnapshot(snapshot)
  } else if (isSetCommandSnapshot(snapshot)) {
    return SetCommand.makeFromSnapshot(snapshot)
  } else if (isSubtractCommandSnapshot(snapshot)) {
    return SubtractCommand.makeFromSnapshot(snapshot)
  } else {
    throw new Error('Unsupported test command type.')
  }
}

export function restoreTestState(snapshot: Snapshot): TestState {
  if (isTestStateSnapshot(snapshot)) {
    return TestState.makeFromSnapshot(snapshot)
  } else {
    throw new Error('Not a test state snapshot.')
  }
}
