import { type Commit } from './commit.js';
import sha1 from 'sha1';
import { type Workspace } from '../workspace/index.js';

export class RevertCommit<TState> implements Commit<TState> {
  private readonly _hash: string;

  private readonly _parent: string;

  private readonly _target: string;

  public constructor(parent: string, target: string) {
    this._hash = sha1(
      JSON.stringify({
        parent,
        target,
      })
    );
    this._parent = parent;
    this._target = target;
  }

  public get hash(): string {
    return this._hash;
  }

  public get parents(): Set<string> {
    return new Set([this._parent]);
  }

  public get primaryParent(): string {
    return this._parent;
  }

  public get target(): string {
    return this._target;
  }

  public apply(context: Workspace<TState>): TState {
    const target = context.getCommit(this._target);

    return target.revert(context);
  }

  public revert(context: Workspace<TState>): TState {
    return context.getState(this._target);
  }
}
