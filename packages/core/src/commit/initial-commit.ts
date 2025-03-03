import sha1 from 'sha1'
import { Snapshot } from '../memento'
import { type Memento } from '../memento/memento'
import { type Commit, CommitSnapshot } from './commit'

export class InitialCommit<TState extends Memento> implements Commit<TState> {
  private readonly _hash: string

  private readonly _state: TState

  public constructor(state: TState) {
    this._hash = sha1(
      JSON.stringify({
        state: state.getSnapshot(),
      })
    )
    this._state = state
  }

  public static makeFromSnapshot<TState extends Memento>(
    snapshot: InitialCommitSnapshot,
    stateRestorer: StateRestorer<TState>
  ): InitialCommit<TState> {
    const state = stateRestorer(snapshot.state)

    return new InitialCommit(state)
  }

  public get hash(): string {
    return this._hash
  }

  public get parents(): Set<string> {
    return new Set()
  }

  public get primaryParent(): string | null {
    return null
  }

  public apply(): TState {
    return this._state
  }

  public revert(): TState {
    throw new Error('Cannot revert initial commit.')
  }

  public getSnapshot(): InitialCommitSnapshot {
    return {
      type: 'Initial',
      hash: this._hash,
      parents: [],
      state: this._state.getSnapshot(),
    }
  }
}

export type InitialCommitSnapshot = CommitSnapshot & {
  type: 'Initial'

  state: Snapshot
}

export function isInitialCommitSnapshot(
  snapshot: CommitSnapshot
): snapshot is InitialCommitSnapshot {
  return snapshot.type === 'Initial'
}

export type StateRestorer<TState> = (stateSnapshot: Snapshot) => TState
