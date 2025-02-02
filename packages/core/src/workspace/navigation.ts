import type { Workspace } from './workspace.js';
import type { Commit } from '../commit/index.js';

export function getAllPreviousCommitsHashes<TState>(
  workspace: Workspace<TState>,
  hash: string,
  stop?: (c: Commit<TState>) => boolean
): Set<string> {
  if (stop?.(workspace.getCommit(hash))) {
    return new Set();
  }

  const visited = new Set<string>();
  const toVisit = [hash];

  while (toVisit.length > 0) {
    const nextHash = toVisit.pop() as string;

    const commit = workspace.getCommit(nextHash);

    [...commit.parents]
      .filter((p) => !visited.has(p) && !stop?.(workspace.getCommit(p)))
      .forEach((p) => {
        toVisit.push(p);
      });

    visited.add(nextHash);
  }

  return visited;
}

// TODO: Change to Iterator.

export function getAllPrimaryPreviousCommits<TState>(
  workspace: Workspace<TState>,
  hash: string,
  stop?: (c: Commit<TState>) => boolean
): Iterable<Commit<TState>> {
  const hashes = getAllPrimaryPreviousCommitHashes(workspace, hash, stop);

  return hashes.map((h) => workspace.getCommit(h));
}

export function getAllPrimaryPreviousCommitHashes<TState>(
  workspace: Workspace<TState>,
  hash: string,
  stop?: (c: Commit<TState>) => boolean
): ReadonlyArray<string> {
  let commit = workspace.getCommit(hash);

  const result: Array<string> = [];

  while (!stop?.(commit)) {
    result.push(commit.hash);

    // Initial commit.
    if (commit.primaryParent === null) {
      break;
    }

    commit = workspace.getCommit(commit.primaryParent);
  }

  return result;
}
