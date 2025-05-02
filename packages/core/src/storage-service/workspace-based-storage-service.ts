import { isLocalBranch } from '../branches';
import type { Memento } from '../memento';
import { InMemoryRepository, Repository } from '../repository';
import { Workspace } from '../workspace';
import {
  makeStoredCommitSnapshot,
  makeStoredLocalBranch,
  StorageService,
  StoredCommitSnapshot,
  StoredLocalBranch,
} from './storage-service';

export class InMemoryStorageService implements StorageService {
  private readonly _commits: Repository<StoredCommitSnapshot>;

  private readonly _localBranches: Repository<StoredLocalBranch>;

  public constructor(
    commits: Repository<StoredCommitSnapshot>,
    localBranches: Repository<StoredLocalBranch>
  ) {
    this._commits = commits;
    this._localBranches = localBranches;
  }

  public static makeFromWorkspace<TState extends Memento>(
    workspace: Workspace<TState>
  ): InMemoryStorageService {
    const allCommits = [...workspace.getAllCommits()]
      .map((c) => c.getSnapshot())
      .map(makeStoredCommitSnapshot);

    const allBranches = workspace.branches
      .getAll()
      .filter(isLocalBranch)
      .map(makeStoredLocalBranch);

    const commits = new InMemoryRepository(allCommits);
    const localBranches = new InMemoryRepository(allBranches);

    return new InMemoryStorageService(commits, localBranches);
  }

  public get commits(): Repository<StoredCommitSnapshot> {
    return this._commits;
  }

  public get localBranches(): Repository<StoredLocalBranch> {
    return this._localBranches;
  }
}
