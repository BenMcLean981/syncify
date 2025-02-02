import type { Snapshot } from '../memento/snapshot.ts';
import { type Workspace } from '../workspace/index.js';

export interface Commit<TState> {
  readonly hash: string;

  readonly parents: Set<string>;

  readonly primaryParent: string | null;

  apply(context: Workspace<TState>): TState;

  revert(context: Workspace<TState>): TState;
}

export interface CommitSnapshot extends Snapshot {
  type: string;

  hash: string;

  parents: ReadonlyArray<string>;
}
