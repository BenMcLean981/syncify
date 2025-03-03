import sha1 from 'sha1'
import { type Command } from '../command'
import { type Memento, Snapshot } from '../memento'
import { type Workspace } from '../workspace'
import { type Commit, CommitSnapshot } from './commit'

export class CommandCommit<TState extends Memento> implements Commit<TState> {
  private readonly _hash: string

  private readonly _parent: string

  private readonly _command: Command<TState>

  public constructor(parent: string, command: Command<TState>) {
    this._hash = sha1(
      JSON.stringify({
        parent,
        command: command.getSnapshot(),
      })
    )
    this._parent = parent
    this._command = command
  }

  public static makeFromSnapshot<TState extends Memento>(
    snapshot: CommandCommitSnapshot,
    commandRestorer: CommandRestorer<TState>
  ): CommandCommit<TState> {
    const command = commandRestorer(snapshot.command)

    if (snapshot.parents.length !== 1) {
      throw new Error('Must have one parent.')
    }

    return new CommandCommit<TState>(snapshot.parents[0], command)
  }

  public get hash(): string {
    return this._hash
  }

  public get parents(): Set<string> {
    return new Set([this._parent])
  }

  public get primaryParent(): string {
    return this._parent
  }

  public apply(context: Workspace<TState>): TState {
    const state = context.getState(this._parent)

    return this._command.apply(state)
  }

  public revert(context: Workspace<TState>): TState {
    return context.getState(this._parent)
  }

  public getSnapshot(): CommandCommitSnapshot {
    return {
      type: 'Command',
      hash: this.hash,
      parents: [this._parent],
      command: this._command.getSnapshot(),
    }
  }
}

export type CommandCommitSnapshot = CommitSnapshot & {
  type: 'Command'

  command: Snapshot
}

export function isCommandCommitSnapshot(
  snapshot: CommitSnapshot
): snapshot is CommandCommitSnapshot {
  return snapshot.type === 'Command'
}

export type CommandRestorer<TState> = (
  commandSnapshot: Snapshot
) => Command<TState>
