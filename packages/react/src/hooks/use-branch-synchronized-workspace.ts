import {
  type BranchSynchronizer,
  isConflict,
  MAIN_BRANCH,
  type Memento,
  type SynchronizationState,
  type Workspace,
  WorkspaceImp,
  WorkspaceManipulator,
} from "@syncify/core";
import { useCallback, useEffect, useRef, useState } from "react";

export type LoadingWorkspaceState = {
  status: "Loading";
};

export type InitialWorkspaceState<TState> = {
  status: "Initial";

  workspace: Workspace<TState>;
};

export type DisconnectedSyncedWorkspaceState<TState> = {
  status: "Disconnected-Synced";

  workspace: Workspace<TState>;
};

export type DisconnectedConflictWorkspaceState<TState> = {
  status: "Disconnected-Conflict";

  local: TState;
  remote: TState;

  takeLocal(): void;
  takeRemote(): void;
};

export type NeverConnectedWorkspaceState = {
  status: "Never-Connected";
};

export type SyncedWorkspaceState<TState> = {
  status: "Synced";

  workspace: Workspace<TState>;

  lastSynced: Date;
};

export type ConflictWorkspaceState<TState> = {
  status: "Conflict";

  local: TState;
  remote: TState;

  takeLocal(): void;
  takeRemote(): void;
};

export type WorkspaceState<TState> =
  | LoadingWorkspaceState
  | InitialWorkspaceState<TState>
  | DisconnectedSyncedWorkspaceState<TState>
  | DisconnectedConflictWorkspaceState<TState>
  | NeverConnectedWorkspaceState
  | SyncedWorkspaceState<TState>
  | ConflictWorkspaceState<TState>;

function getInitialStatus<TState>(
  initial?: Workspace<TState>,
): WorkspaceState<TState> {
  if (initial === undefined) {
    return {
      status: "Loading",
    };
  } else {
    return {
      status: "Initial",
      workspace: initial,
    };
  }
}

const DEFAULT_FREQUENCY = 10_000;

export function useBranchSynchronizedWorkspace<TState extends Memento>(
  synchronizer: BranchSynchronizer<TState>,
  initial?: Workspace<TState>,
  frequency = DEFAULT_FREQUENCY,
  branchName = MAIN_BRANCH,
): WorkspaceState<TState> & { fetching: boolean } {
  const synchronizerRef = useRef(synchronizer);
  const branchNameRef = useRef(branchName);

  if (frequency < DEFAULT_FREQUENCY) {
    throw new Error(
      `Cannot have sync frequency less than ${
        DEFAULT_FREQUENCY / 1000
      } seconds.`,
    );
  }

  const [fetching, setFetching] = useState(false);
  const [state, setState] = useState<WorkspaceState<TState>>(
    getInitialStatus(initial),
  );

  const handleResult = useCallback((result: SynchronizationState<TState>) => {
    if (isConflict(result)) {
      const localBranch = result.workspace.branches.getLocalBranch(
        branchNameRef.current,
      );
      const remoteBranch = result.workspace.branches.getRemoteBranch(
        branchNameRef.current,
      );

      const manipulator = new WorkspaceManipulator<TState>(result.workspace);

      function takeLocal() {
        const localResult = manipulator.mergeSource(
          remoteBranch.head,
          branchNameRef.current,
        ).workspace;

        setState({
          status: "Synced",
          workspace: localResult,
          lastSynced: new Date(),
        });
      }

      function takeRemote() {
        const remoteResult = manipulator.mergeTarget(
          remoteBranch.head,
          branchNameRef.current,
        ).workspace;

        setState({
          status: "Synced",
          workspace: remoteResult,
          lastSynced: new Date(),
        });
      }

      setState({
        status: "Conflict",
        local: result.workspace.getState(localBranch.head),
        remote: result.workspace.getState(remoteBranch.head),
        takeLocal,
        takeRemote,
      });
    } else {
      setState({
        status: "Synced",
        workspace: result.workspace,
        lastSynced: new Date(),
      });
    }
  }, []);

  const handleFailure = useCallback((e: unknown) => {
    console.error(e);

    setState((state) => {
      switch (state.status) {
        case "Never-Connected":
        case "Loading":
          return { status: "Never-Connected" };
        case "Initial":
        case "Disconnected-Synced":
        case "Synced":
          return { ...state, status: "Disconnected-Synced" };
        case "Conflict":
        case "Disconnected-Conflict":
          return { ...state, status: "Disconnected-Conflict" };
      }
    });
  }, []);

  const synchronize = useCallback(async () => {
    if (fetching) {
      return;
    }

    setFetching(true);

    synchronizerRef.current
      .synchronize(WorkspaceImp.makeEmpty<TState>(), branchNameRef.current)
      .then(handleResult)
      .catch(handleFailure)
      .finally(() => setFetching(false));
  }, [handleFailure, handleResult, fetching]);

  useEffect(() => {
    const interval = setInterval(synchronize, frequency);

    return () => clearInterval(interval);
  }, [frequency, synchronize]);

  return { ...state, fetching };
}
