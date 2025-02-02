import { type Commit } from './commit.js';
import { type Memento } from '../memento/index.js';
import sha1 from 'sha1';
import { type Workspace } from '../workspace/index.js';

export class MergeCommit<TState extends Memento> implements Commit<TState> {
  private readonly _hash: string;

  private readonly _target: string;

  private readonly _source: string;

  private readonly _selection: string;

  /**
   * Creates a new MergeCommit.
   *
   * @param target The branch being merged onto.
   * @param source The branch being merged in.
   * @param selection The branch to keep.
   */
  public constructor(target: string, source: string, selection: string) {
    MergeCommit.validate(target, source, selection);

    this._hash = sha1(
      JSON.stringify({
        target,
        source,
        selection,
      })
    );

    this._target = target;
    this._source = source;
    this._selection = selection;
  }

  public get hash(): string {
    return this._hash;
  }

  public get parents(): Set<string> {
    return new Set([this._target, this._source]);
  }

  public get primaryParent(): string {
    return this._target;
  }

  private static validate(target: string, source: string, selection: string) {
    if (target === source) {
      throw new Error('Cannot merge target into source.');
    }

    if (selection !== target && selection !== source) {
      throw new Error('Merge commit has invalid selection.');
    }
  }

  public apply(context: Workspace<TState>): TState {
    return context.getState(this._selection);
  }

  public revert(context: Workspace<TState>): TState {
    return context.getState(this._target);
  }
}
