import type { Workspace } from "../workspace";

/**
 * Synchronization state where the branch was fast-forward-able.
 * The workspace is up to date.
 */
export type SyncedState<TState> = {
  status: 'Synced';

  workspace: Workspace<TState>;
};

/**
 * Synchronization state where there is a conflict on the branch.
 * The workspace has all the relevant commits and has the branches
 * all updated.
 */
export type ConflictState<TState> = {
  status: 'Conflict';

  workspace: Workspace<TState>;
};

export type SynchronizationState<TState> =
  | SyncedState<TState>
  | ConflictState<TState>;

export function isSynced<TState>(
  result: SynchronizationState<TState>
): result is SyncedState<TState> {
  return result.status === 'Synced';
}

export function isConflict<TState>(
  result: SynchronizationState<TState>
): result is ConflictState<TState> {
  return result.status === 'Conflict';
}

/**
 * Abstraction for an object that synchronizes a branch on a workspace.
 */
export interface BranchSynchronizer<TState> {
  /**
   * Synchronizes the branch, returns either the synchronized workspace
   * or a conflict state with fetched workspace.
   *
   * @param workspace The workspace to synchronize.
   * @param branchName The branch to synchronize.
   *
   * @returns Either a synchronized merged workspace, or a workspace in conflict..
   */
  synchronize(workspace: Workspace<TState>, branchName: string): Promise<SynchronizationState<TState>>;
}