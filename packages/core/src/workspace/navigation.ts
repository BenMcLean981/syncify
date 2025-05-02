import { Commit } from '../commit';
import type { Workspace } from './workspace';

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
