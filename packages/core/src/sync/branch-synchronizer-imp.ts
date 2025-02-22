import { type Workspace } from '../workspace';
import { type RemoteFetcher } from '../remote-fetcher';
import { MAIN_BRANCH, makeLocalBranch, makeRemoteBranch, } from '../branches';
import { type Differences, getDifferences } from './differences';
import { getAllPreviousCommitsHashes } from '../workspace/navigation';
import { BranchSynchronizer, SynchronizationState } from "./branch-synchronizer";

export class BranchSynchronizerImp<TState> implements BranchSynchronizer<TState> {
  private readonly _fetcher: RemoteFetcher<TState>

  public constructor(fetcher: RemoteFetcher<TState>) {
    this._fetcher = fetcher;
  }

  public async synchronize(workspace: Workspace<TState>, branchName: string = MAIN_BRANCH): Promise<SynchronizationState<TState>> {
    const refsUpdated = await fetch(workspace, this._fetcher, branchName);
    const ready = await ensureBranchesCreated(refsUpdated, this._fetcher, branchName);

    return synchronizeBranch(ready, this._fetcher, branchName);
  }
}

async function fetch<TState>(
  workspace: Workspace<TState>,
  fetcher: RemoteFetcher<TState>,
  branchName: string
) {
  const remoteBranch = await fetcher.getBranch(branchName);

  if (remoteBranch === undefined) {
    return workspace;
  } else {
    const latestHash = getHashToFetchFrom(workspace, branchName);
    const remoteAfter = await fetcher.fetch(branchName, latestHash);

    const newBranches = workspace.branches.upsertBranch(
      makeRemoteBranch(branchName, remoteBranch.head)
    );

    const toAdd = remoteAfter.filter((c) => !workspace.hasCommit(c.hash));

    return workspace.addCommits(toAdd).setBranches(newBranches);
  }
}

function getHashToFetchFrom(
  workspace: Workspace<unknown>,
  branchName: string
): string {
  if (workspace.branches.containsRemoteBranch(branchName)) {
    return workspace.branches.getRemoteBranch(branchName).head;
  } else {
    return workspace.initialHash;
  }
}

async function ensureBranchesCreated<TState>(
  workspace: Workspace<TState>,
  fetcher: RemoteFetcher<TState>,
  branchName: string
): Promise<Workspace<TState>> {
  if (!workspace.branches.containsLocalBranch(branchName)) {
    // TODO: Support creating new branches.

    throw new Error(`Missing local branch "${branchName}"`);
  } else if (!workspace.branches.containsRemoteBranch(branchName)) {
    const local = workspace.branches.getLocalBranch(branchName);
    const hashes = getAllPreviousCommitsHashes(workspace, local.head);
    const commits = [...hashes].map((h) => workspace.getCommit(h));

    await fetcher.push(commits, branchName, local.head);

    return workspace.setBranches(
      workspace.branches.upsertBranch(makeRemoteBranch(branchName, local.head))
    );
  } else {
    return workspace;
  }
}

async function synchronizeBranch<TState>(
  workspace: Workspace<TState>,
  fetcher: RemoteFetcher<TState>,
  branchName: string
): Promise<SynchronizationState<TState>> {
  const differences = getDifferences(workspace, branchName);

  if (isRemoteAhead(differences)) {
    return {
      status: 'Synced',
      workspace: fastForward(workspace, branchName),
    };
  } else if (isLocalAhead(differences)) {
    return {
      status: 'Synced',
      workspace: await push(workspace, fetcher, branchName),
    };
  } else if (noDifference(differences)) {
    return { status: 'Synced', workspace };
  } else if (isInConflict(differences)) {
    return { status: 'Conflict', workspace };
  } else {
    // Will never happen.

    throw new Error('Something went wrong, invalid differences.');
  }
}

function noDifference(differences: Differences): boolean {
  return (
    differences.localDifference.size === 0 &&
    differences.remoteDifference.size === 0
  );
}

function isRemoteAhead(differences: Differences): boolean {
  return (
    differences.localDifference.size === 0 &&
    differences.remoteDifference.size !== 0
  );
}

function isLocalAhead(differences: Differences): boolean {
  return (
    differences.localDifference.size !== 0 &&
    differences.remoteDifference.size === 0
  );
}

function isInConflict(differences: Differences): boolean {
  return (
    differences.localDifference.size !== 0 &&
    differences.remoteDifference.size !== 0
  );
}

function fastForward<TState>(
  workspace: Workspace<TState>,
  branchName: string
): Workspace<TState> {
  const differences = getDifferences(workspace, branchName);

  if (!isRemoteAhead(differences)) {
    throw new Error('Cannot fast forward, remote not ahead.');
  }

  const remoteBranch = workspace.branches.getRemoteBranch(branchName);
  const newBranches = workspace.branches.updateBranch(
    makeLocalBranch(branchName, remoteBranch.head)
  );

  return workspace.setBranches(newBranches);
}

async function push<TState>(
  workspace: Workspace<TState>,
  fetcher: RemoteFetcher<TState>,
  branchName: string
) {
  const differences = getDifferences(workspace, branchName);

  if (!isLocalAhead(differences)) {
    throw new Error('Cannot push, local is missing commits.');
  }

  const local = workspace.branches.getLocalBranch(branchName);
  const commits = [...differences.localDifference].map((hash) =>
    workspace.getCommit(hash)
  );

  await fetcher.push(commits, branchName, local.head);

  const newRemote = makeRemoteBranch(branchName, local.head);
  const newBranches = workspace.branches.updateBranch(newRemote);

  return workspace.setBranches(newBranches);
}
