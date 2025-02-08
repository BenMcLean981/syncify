import {
  fetchAndSynchronizeBranch,
  isConflict,
  MAIN_BRANCH,
  type Memento,
  type RemoteFetcher,
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

export type FetchingWorkspaceState<TState> = {
  status: "Fetching";

  workspace: Workspace<TState>;
};

export type DisconnectedWorkspaceState<TState> = {
  status: "Disconnected";

  workspace: Workspace<TState>;
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
  | FetchingWorkspaceState<TState>
  | DisconnectedWorkspaceState<TState>
  | NeverConnectedWorkspaceState
  | SyncedWorkspaceState<TState>
  | ConflictWorkspaceState<TState>;

function getInitialStatus<TState>(
  initial?: Workspace<TState>
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

export function useBranchSynchronizedWorkspaceState<TState extends Memento>(
  fetcher: RemoteFetcher<TState>,
  initial?: Workspace<TState>,
  frequency = DEFAULT_FREQUENCY,
  branchName = MAIN_BRANCH
): WorkspaceState<TState> {
  const fetcherRef = useRef(fetcher);

  if (frequency < DEFAULT_FREQUENCY) {
    throw new Error(
      `Cannot have sync frequency less than ${
        DEFAULT_FREQUENCY / 1000
      } seconds.`
    );
  }

  const [state, setState] = useState<WorkspaceState<TState>>(
    getInitialStatus(initial)
  );

  const handleResult = useCallback(
    (result: SynchronizationState<TState>) => {
      if (isConflict(result)) {
        const localBranch =
          result.workspace.branches.getLocalBranch(branchName);
        const remoteBranch =
          result.workspace.branches.getRemoteBranch(branchName);

        const manipulator = new WorkspaceManipulator<TState>(result.workspace);

        function takeLocal() {
          const localResult = manipulator.mergeSource(
            remoteBranch.head,
            branchName
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
            branchName
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
    },
    [branchName]
  );

  const handleFailure = useCallback((e: unknown) => {
    console.error(e);

    setState({ status: "Never-Connected" });
  }, []);

  const synchronize = useCallback(async () => {
    if (state.status === "Fetching") {
      return;
    }

    fetchAndSynchronizeBranch(
      WorkspaceImp.makeEmpty<TState>(),
      fetcherRef.current,
      branchName
    )
      .then(handleResult)
      .catch(handleFailure);
  }, [branchName, handleFailure, handleResult, state.status]);

  useEffect(() => {
    const interval = setInterval(synchronize, frequency);

    return () => clearInterval(interval);
  }, [frequency, synchronize]);

  return state;
}
