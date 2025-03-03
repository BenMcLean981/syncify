import type { Memento, Snapshot } from '../memento';
import { type Workspace } from '../workspace';

export interface Commit<TState> extends Memento {
  readonly hash: string;

  readonly parents: Set<string>;

  readonly primaryParent: string | null;

  apply(context: Workspace<TState>): TState;

  revert(context: Workspace<TState>): TState;

  getSnapshot(): CommitSnapshot;
}

export interface CommitSnapshot extends Snapshot {
  type: string;

  hash: string;

  parents: ReadonlyArray<string>;
}
