import { type Equalable } from '../equality';
import { type Snapshot } from '../memento';
import { type Commit, type CommitSnapshot } from '../commit';
import { type Branches } from '../branches';

export interface Workspace<TState> extends Equalable {
  readonly id: string;

  readonly branches: Branches;

  readonly initialHash: string;

  getState(hash: string): TState;

  hasCommit(hash: string): boolean;

  getCommit(hash: string): Commit<TState>;

  addCommit(commit: Commit<TState>): Workspace<TState>;

  addCommits(commits: Iterable<Commit<TState>>): Workspace<TState>;

  setBranches(branches: Branches): Workspace<TState>;
}
