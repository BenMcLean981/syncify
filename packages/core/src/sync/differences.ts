import { type Workspace } from '../workspace/index.js';
import { getAllPreviousCommitsHashes } from '../workspace/navigation.js';

export type Differences = {
  /**
   * The hashes on local that are not on remote.
   */
  localDifference: Set<string>;

  /**
   * The hashes on remote that are not on local.
   */
  remoteDifference: Set<string>;
};

export function getDifferences<TState>(
  workspace: Workspace<TState>,
  branchName: string
): Differences {
  const localBranch = workspace.branches.getLocalBranch(branchName);
  const remoteBranch = workspace.branches.getRemoteBranch(branchName);

  const allLocalCommits = getAllPreviousCommitsHashes(
    workspace,
    localBranch.head
  );
  const allRemoteCommits = getAllPreviousCommitsHashes(
    workspace,
    remoteBranch.head
  );

  const localDifference = difference(allLocalCommits, allRemoteCommits);
  const remoteDifference = difference(allRemoteCommits, allLocalCommits);

  return {
    localDifference,
    remoteDifference,
  };
}

function difference<T>(setA: Set<T>, setB: Set<T>): Set<T> {
  const items = [...setA].filter((a) => !setB.has(a));

  return new Set(items);
}
