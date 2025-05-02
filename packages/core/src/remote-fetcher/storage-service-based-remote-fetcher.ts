import { Branch, makeLocalBranch } from '../branches';
import {
  CommandRestorer,
  type Commit,
  CommitSnapshot,
  StateRestorer,
} from '../commit';
import { restoreCommit } from '../commit/utils';
import { type Memento } from '../memento';
import {
  getCommitIdFromHash,
  getLocalBranchId,
  makeStoredCommitSnapshot,
  makeStoredLocalBranch,
  StorageService,
} from '../storage-service/storage-service';
import { type RemoteFetcher } from './remote-fetcher';

export class InMemoryRemoteFetcher<TState extends Memento>
  implements RemoteFetcher
{
  private _storageService: StorageService;

  private readonly _commandRestorer: CommandRestorer<TState>;

  private readonly _stateRestorer: StateRestorer<TState>;

  public constructor(
    storageService: StorageService,
    commandRestorer: CommandRestorer<TState>,
    stateRestorer: StateRestorer<TState>
  ) {
    this._storageService = storageService;
    this._commandRestorer = commandRestorer;
    this._stateRestorer = stateRestorer;
  }

  public async fetch(
    branchName: string,
    from: string
  ): Promise<ReadonlyArray<CommitSnapshot>> {
    if (!(await this._storageService.hasCommit(from))) {
      return [];
    }

    const local = await this._storageService.getBranch(branchName);
    const hashes = await this.fetchAllPreviousCommitsHashes(
      local.head,
      (c) => c.hash === from
    );

    return await Promise.all(
      [...hashes]
        .map(getCommitIdFromHash)
        .map((id) => this._storageService.commits.get(id))
    );
  }

  public async push(
    commitSnapshots: ReadonlyArray<CommitSnapshot>,
    branchName: string,
    newHead: string
  ): Promise<void> {
    const commits = commitSnapshots.map((c) =>
      restoreCommit(c, this._commandRestorer, this._stateRestorer)
    );

    this.validatePush(commits, branchName, newHead);

    for (const c of commits) {
      await this._storageService.commits.add(
        makeStoredCommitSnapshot(c.getSnapshot())
      );
    }

    await this._storageService.localBranches.update(
      makeStoredLocalBranch(makeLocalBranch(branchName, newHead))
    );
  }

  public async getBranch(branchName: string): Promise<Branch | undefined> {
    if (!(await this.containsBranch(branchName))) {
      return undefined;
    } else {
      return this._storageService.localBranches.get(branchName);
    }
  }

  private async containsBranch(branchName: string) {
    return await this._storageService.localBranches.contains(
      getLocalBranchId(branchName)
    );
  }

  private async validatePush(
    commits: ReadonlyArray<Commit<TState>>,
    branchName: string,
    newHead: string
  ): Promise<void> {
    for (const c of commits) {
      await this._storageService.commits.add(
        makeStoredCommitSnapshot(c.getSnapshot())
      );
    }

    const toRoot = await this.fetchAllPreviousCommitsHashes(newHead);
    const oldBranch = await this.getBranch(branchName);

    if (oldBranch === undefined) {
      return;
    }

    const isDescendent = toRoot.has(oldBranch.head);

    if (!isDescendent) {
      throw new Error('Cannot push, local is missing commits from upstream.');
    }
  }

  private async fetchAllPreviousCommitsHashes(
    hash: string,
    stop?: (c: Commit<TState>) => boolean
  ): Promise<Set<string>> {
    const firstCommit = await this.retrieveCommitByHash(hash);

    if (stop?.(firstCommit)) {
      return new Set();
    }

    const visited = new Set<string>();
    const toVisit = [hash];

    while (toVisit.length > 0) {
      const nextHash = toVisit.pop() as string;

      const commit = await this.retrieveCommitByHash(nextHash);

      for (const parentCommitHash of commit.parents) {
        const parentCommit = await this.retrieveCommitByHash(parentCommitHash);

        const shouldStop = stop?.(parentCommit);

        if (!visited.has(parentCommitHash) && !shouldStop) {
          toVisit.push(parentCommitHash);
        }
      }

      visited.add(nextHash);
    }

    return visited;
  }

  private async retrieveCommitByHash(hash: string): Promise<Commit<TState>> {
    const snapshot = await this._storageService.commits.get(
      getCommitIdFromHash(hash)
    );

    return restoreCommit(snapshot, this._commandRestorer, this._stateRestorer);
  }
}
