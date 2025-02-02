import { type Commit } from './commit.js';
import { type Memento } from '../memento/index.js';
import sha1 from 'sha1';
import { type Command } from '../command/index.js';
import { type Workspace } from '../workspace/index.js';

export class CommandCommit<TState extends Memento> implements Commit<TState> {
  private readonly _hash: string;

  private readonly _parent: string;

  private readonly _command: Command<TState>;

  public constructor(parent: string, command: Command<TState>) {
    this._hash = sha1(
      JSON.stringify({
        parent,
        command: command.getSnapshot(),
      })
    );
    this._parent = parent;
    this._command = command;
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

  public apply(context: Workspace<TState>): TState {
    const state = context.getState(this._parent);

    return this._command.apply(state);
  }

  public revert(context: Workspace<TState>): TState {
    return context.getState(this._parent);
  }
}
