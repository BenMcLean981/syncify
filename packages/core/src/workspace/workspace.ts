import { type Branches } from '../branches';
import { type Commit } from '../commit';
import { type Equalable } from '../equality';

export interface Workspace<TState> extends Equalable {
  readonly id: string;

  readonly branches: Branches;

  readonly initialHash: string;

  getState(hash: string): TState;

  hasCommit(hash: string): boolean;

  getCommit(hash: string): Commit<TState>;

  getAllCommits(): Iterable<Commit<TState>>;

  addCommit(commit: Commit<TState>): Workspace<TState>;

  addCommits(commits: Iterable<Commit<TState>>): Workspace<TState>;

  setBranches(branches: Branches): Workspace<TState>;
}
