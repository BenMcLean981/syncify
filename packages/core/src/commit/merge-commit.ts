import sha1 from 'sha1'
import { type Memento } from '../memento'
import { type Workspace } from '../workspace'
import { type Commit, CommitSnapshot } from './commit'

export class MergeCommit<TState extends Memento> implements Commit<TState> {
  private readonly _hash: string

  private readonly _target: string

  private readonly _source: string

  private readonly _selection: string

  /**
   * Creates a new MergeCommit.
   *
   * @param target The branch being merged onto.
   * @param source The branch being merged in.
   * @param selection The branch to keep.
   */
  public constructor(target: string, source: string, selection: string) {
    MergeCommit.validate(target, source, selection)

    this._hash = sha1(
      JSON.stringify({
        target,
        source,
        selection,
      })
    )

    this._target = target
    this._source = source
    this._selection = selection
  }

  public static makeFromSnapshot<TState extends Memento>(
    snapshot: MergeCommitSnapshot
  ): MergeCommit<TState> {
    return new MergeCommit(snapshot.target, snapshot.source, snapshot.selection)
  }

  public get hash(): string {
    return this._hash
  }

  public get parents(): Set<string> {
    return new Set([this._target, this._source])
  }

  public get primaryParent(): string {
    return this._target
  }

  private static validate(target: string, source: string, selection: string) {
    if (target === source) {
      throw new Error('Cannot merge target into source.')
    }

    if (selection !== target && selection !== source) {
      throw new Error('Merge commit has invalid selection.')
    }
  }

  public apply(context: Workspace<TState>): TState {
    return context.getState(this._selection)
  }

  public revert(context: Workspace<TState>): TState {
    return context.getState(this._target)
  }

  public getSnapshot(): MergeCommitSnapshot {
    return {
      type: 'Merge',
      hash: this._hash,
      parents: [...this.parents],
      target: this._target,
      source: this._source,
      selection: this._selection,
    }
  }
}

export type MergeCommitSnapshot = CommitSnapshot & {
  type: 'Merge'

  target: string

  source: string

  selection: string
}

export function isMergeCommitSnapshot(
  snapshot: CommitSnapshot
): snapshot is MergeCommitSnapshot {
  return snapshot.type === 'Merge'
}
