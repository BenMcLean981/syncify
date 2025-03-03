import { Memento } from '../memento'
import {
  CommandCommit,
  CommandRestorer,
  isCommandCommitSnapshot,
} from './command-commit'
import { Commit, CommitSnapshot } from './commit'
import {
  InitialCommit,
  isInitialCommitSnapshot,
  StateRestorer,
} from './initial-commit'
import { isMergeCommitSnapshot, MergeCommit } from './merge-commit'
import { isRevertCommitSnapshot, RevertCommit } from './revert-commit'

export function restoreCommit<TState extends Memento>(
  snapshot: CommitSnapshot,
  commandRestorer: CommandRestorer<TState>,
  stateRestorer: StateRestorer<TState>
): Commit<TState> {
  if (isCommandCommitSnapshot(snapshot)) {
    return CommandCommit.makeFromSnapshot<TState>(snapshot, commandRestorer)
  } else if (isInitialCommitSnapshot(snapshot)) {
    return InitialCommit.makeFromSnapshot<TState>(snapshot, stateRestorer)
  } else if (isMergeCommitSnapshot(snapshot)) {
    return MergeCommit.makeFromSnapshot<TState>(snapshot)
  } else if (isRevertCommitSnapshot(snapshot)) {
    return RevertCommit.makeFromSnapshot<TState>(snapshot)
  } else {
    throw new Error(`Unsupported commit type "${snapshot.type}".`)
  }
}
