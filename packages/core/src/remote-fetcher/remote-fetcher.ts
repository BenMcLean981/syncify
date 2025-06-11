import { type Branch } from '../branches';
import { CommitSnapshot } from '../commit';

export interface RemoteFetcher {
  /**
   * Fetch the commits ahead of the given hash.
   *
   * @param branchName Branch to fetch commits from.
   * @param hash Hash to fetch commits after.
   */
  fetch(
    branchName: string,
    hash: string
  ): Promise<ReadonlyArray<CommitSnapshot>>;

  push(
    commits: ReadonlyArray<CommitSnapshot>,
    branchName: string,
    newHead: string
  ): Promise<void>;

  getBranch(branchName: string): Promise<Branch | undefined>;
}
