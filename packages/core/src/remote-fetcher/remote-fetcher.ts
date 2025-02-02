import { type Commit } from '../commit/commit.js';
import { type Branch } from '../branches/index.js';

export interface RemoteFetcher<TState> {
  /**
   * Fetch the commits ahead of the given hash.
   *
   * @param branchName Branch to fetch commits from.
   * @param hash Hash to fetch commits after.
   */
  fetch(
    branchName: string,
    hash: string
  ): Promise<ReadonlyArray<Commit<TState>>>;

  push(
    commits: ReadonlyArray<Commit<TState>>,
    branchName: string,
    newHead: string
  ): Promise<void>;

  getBranch(branchName: string): Promise<Branch | undefined>;
}
